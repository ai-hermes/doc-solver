import fs from 'fs';
import COS from "cos-nodejs-sdk-v5";
import { BaseQueue } from "./base";
import { getCOSClient } from "@/lib/clients/cos";
import { env } from 'env.mjs';
import { WeaviateStore } from 'langchain/vectorstores/weaviate'
import { PDFLoader } from '@/lib/pdfLoader';
import { getOpenAIEmbeddings } from '@/lib/clients/llm';
import { getPrismaClient } from '@/lib/clients/prisma';
import { PrismaClient } from '@prisma/client';
import { getWeaviateClient } from '@/lib/clients/weaviate';
import { WeaviateClient } from 'weaviate-ts-client';
interface IngestQueueData {
    source: string;
    indexName: string;
    pdfUrl: string;
    pdfMd5Key: string;
    taskId: string;
}

export class IngestQueue extends BaseQueue<IngestQueueData> {
    private cosClient: COS;
    private pdfTmpDir: string;
    private prisma: PrismaClient;
    private weaviateClient: WeaviateClient
    constructor(pdfTmpDir?: string) {
        super();
        this.cosClient = getCOSClient();
        this.prisma = getPrismaClient();
        this.weaviateClient = getWeaviateClient();
        // '/home/tiger/workspace/doc-solver/tmp/'
        this.pdfTmpDir = pdfTmpDir || `${process.cwd()}/tmp/`
    }
    public getQueueName(): string {
        return "ingest";
    }
    public getConcurrency(): number {
        return 10;
    }

    public static getQueue() {
        return BaseQueue._getQueue('ingest')
    }

    public async handle(job: { id: string; data: IngestQueueData; }) {
        const {
            data: { pdfMd5Key, source, indexName, taskId }
        } = job;
        console.log(`Processing job ${job.id}`);
        console.log('job data', job.data)

        try {
            console.log('check schema')
            // if one pdf be embedding multi times, there will be duplicate chunk stored in vector store
            // so we need to check status of pdf first avoid duplicate process of same pdf file.
            const isIndexExist = await this.weaviateClient.schema.exists(indexName)
            if (isIndexExist) {
                console.log(`schema with name ${indexName} alreay exist, skip embedding`)
            } else {
                console.log(`schema with name ${indexName} not exist, start embedding`)
                console.log('start to get object')
                const pdfLocalPath = `${this.pdfTmpDir}${pdfMd5Key}`;
                const fileStream = fs.createWriteStream(pdfLocalPath);
                await this.cosClient.getObject({
                    Bucket: env.QCLOUD_BUCKET,
                    Region: env.QCLOUD_REGION,
                    Key: pdfMd5Key,
                    Output: fileStream,
                })
                console.log('get object finished')


                const loader = new PDFLoader(
                    pdfLocalPath,
                    {
                        metaData: {
                            source: source,
                            indexName: indexName,
                        }
                    }
                );
                const docs = await loader.load();
                const { chunks } = loader.getChunkAndLines();

                console.log('start to write db')
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                const promises: Array<Promise<any>> = []
                chunks.forEach((chunk) => {
                    const p = this.prisma.chunk.create({
                        data: {
                            id: chunk.id || '',
                            content: chunk.str,
                            attribute: chunk.attribute || {},
                        }
                    })
                    promises.push(p)

                    chunk.lines.forEach(l => {
                        const p = this.prisma.chunkLine.create({
                            data: {
                                id: l.id || '',
                                content: l.str,
                                chunk_id: chunk.id || '',
                                rect_info: l.rect,
                                origin_info: l,
                                attribute: l.attribute || {},
                            }
                        })

                        promises.push(p)
                    })
                })
                await Promise.all(promises)
                console.log('write db finished')

                console.log('start to write vector store')
                const embeddings = getOpenAIEmbeddings();
                await WeaviateStore.fromDocuments(docs, embeddings, {
                    client: getWeaviateClient(),
                    indexName: indexName,
                    textKey: 'text',
                })
                console.log('write vector finished')
            }



            console.log('job finished')
            await this.prisma.task.update({
                where: {
                    id: taskId
                },
                data: {
                    task_status: 'successed',
                }
            })
        } catch (e) {
            console.log('job failed', e)
            await this.prisma.task.update({
                where: {
                    id: taskId
                },
                data: {
                    task_status: 'failed',
                }
            })
        }
    }
}
