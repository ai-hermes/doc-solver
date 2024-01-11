import { WeaviateStore } from 'langchain/vectorstores/weaviate'
import fs from 'fs';
import { PDFLoader } from '@/lib/pdfLoader';
import { getPrismaClient } from '@/lib/clients/prisma';
import { getOpenAIEmbeddings } from '@/lib/clients/llm';
import { getWeaviateClient } from '@/lib/clients/weaviate';

async function main() {
    const prisma = getPrismaClient();
    const source = 'raft.pdf';
    const indexName = 'Test10';
    const loader = new PDFLoader(
        '/home/tiger/workspace/doc-solver/tmp/pdf/d6db6fd34c5ea56fa1dc8f55df17830e',
        {
            metaData: {
                source: source,
                indexName: indexName,
            }
        }
    )
    const docs = await loader.load();
    const { chunks } = loader.getChunkAndLines();
    fs.writeFileSync('chunks.txt', JSON.stringify(chunks))

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const promises: Array<Promise<any>> = []
    chunks.forEach((chunk) => {
        // console.log({
        //     id: chunk.id || '',
        //     content: chunk.str,
        //     attribute: chunk.attribute || {},
        // })
        const p = prisma.chunk.create({
            data: {
                id: chunk.id || '',
                content: chunk.str,
                attribute: chunk.attribute || {},
            }
        })
        promises.push(p)


        chunk.lines.forEach(l => {
            // console.log({
            //     id: l.id || '',
            //     content: l.str,
            //     chunk_id: chunk.id || '',
            //     rect_info: l.rect,
            //     origin_info: l,
            // })
            const p = prisma.chunkLine.create({
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
    console.log('db write finished')

    // const docs = await loader.load()
    const embeddings = getOpenAIEmbeddings()
    await WeaviateStore.fromDocuments(docs, embeddings, {
        client: getWeaviateClient(),
        indexName: indexName,
        textKey: 'text',
    })
    console.log('embedding finished');

};

main()
    .catch(console.error)
    .finally(() => process.exit(0))