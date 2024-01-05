import type { NextApiRequest, NextApiResponse } from 'next';
import Queue from 'bee-queue';
import COS from 'cos-nodejs-sdk-v5';
import fs from 'fs';
import path from 'path';

import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { embeddingBaseCfg, extraCfg } from '@/config/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { WeaviateStore } from 'langchain/vectorstores/weaviate'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

let cos: COS;
function getCOSClient() {
    if (!cos) {
        cos = new COS({
            SecretId: process.env.QCLOUD_SECRET_ID,
            SecretKey: process.env.QCLOUD_SECRET_KEY,
        })
    }
    return cos
}

export function sleep(n: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null)
        }, n * 1000)
    })
}

let weaviateClient: WeaviateClient;
export function getWeaviateClient() {
    if (weaviateClient) return weaviateClient
    console.log(process.env.WEAVIATE_SCHEMA, process.env.WEAVIATE_HOST)
    weaviateClient = weaviate.client({
        scheme: process.env.WEAVIATE_SCHEMA,
        host: process.env.WEAVIATE_HOST || '',
    });
    return weaviateClient
}

async function embedPdf(pdfLocalPath: string) {
    const loader = new PDFLoader(pdfLocalPath);
    const embeddings = new OpenAIEmbeddings(embeddingBaseCfg, extraCfg);
    const rawDocs = await loader.load();
    console.log('rawDocs', rawDocs.length)
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    let docs = await textSplitter.splitDocuments(rawDocs);
    docs = docs.map(doc => {
        const { source } = doc.metadata
        return {
            ...doc,
            metadata: {
                "source": path.basename(source),
            } as typeof doc.metadata,
        }
    })
    console.log('split docs', docs);
    await WeaviateStore.fromDocuments(docs, embeddings, {
        client: getWeaviateClient(),
        indexName: 'Test4',
        textKey: 'text',
    })
    console.log('embedding finished');
}
let queue: Queue;
export function getQueue(): Queue {
    if (!queue) {
        queue = new Queue('test', {
            redis: {
                host: '127.0.0.1',
                port: 6379,
                db: 0,
                password: 'docsolver123456',
                options: {},
            },
        })
        queue.process(async (job: {
            id: string;
            data: {
                pdfUrl: string;
                pdfMd5Key: string;
            };
        }) => {
            console.log(`Processing job ${job.id}`);
            await embedPdf(`/home/tiger/workspace/doc-solver/tmp/${job.data.pdfMd5Key}`)
            // await sleep(20)
            console.log('return data')
            console.log('job data', job.data)
            // save pdf to local tmp path
            // split、embedding and save the result to weaviate
            return
        });
    }
    return queue
}



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { pdfUrl, pdfMd5Key } = req.body;
    console.log({ pdfUrl, pdfMd5Key })
    const cosClient = getCOSClient()
    // fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const f = fs.createWriteStream(`/home/tiger/workspace/doc-solver/tmp/${pdfMd5Key}`);
    await cosClient.getObject({
        Bucket: process.env.QCLOUD_BUCKET,
        Region: process.env.QCLOUD_REGION,
        Key: pdfMd5Key,
        Output: f,
    })
    console.log('get object success')

    const queue = getQueue()
    const job = await queue.createJob({
        pdfUrl,
        pdfMd5Key,
    }).save()
    console.log(`Job ${job.id} saved`)
    res.status(200).json({
        jobId: job.id,
        status: job.status,
    })
    /*
    async (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ error: err })
            return
        }
        const queue = getQueue()
        const job = await queue.createJob({
            pdfUrl,
            pdfMd5Key,
        }).save()
        console.log(`Job ${job.id} saved`)
    }
    */

}