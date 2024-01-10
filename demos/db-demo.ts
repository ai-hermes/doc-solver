// import { PrismaClient } from '@prisma/client/edge';
import { PrismaClient } from "@prisma/client";
import { getPdfItems, generateChunks } from './utils';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();


const rootPath = '/workspaces/gpt4-pdf-chatbot-langchain'
const pdfPath = `${rootPath}/docs/raft.pdf`;
const source = "raft.pdf"

async function main() {
    // ... you will write your Prisma Client queries here
    // const chunks = await prisma.chunks.findMany();
    // console.log(chunks);
    const items = await getPdfItems(pdfPath)
    const chuncks = generateChunks(items)
    // await prisma.chunks.

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const promises: Array<Promise<any>> = []
    chuncks.forEach((chuck, index) => {
        const puuid = uuidv4();
        const p = prisma.chunks.create({
            data: {
                id: puuid,
                content: chuck.str,
                attribute: {
                    "source": source,
                    "inner_chunk_no": index,
                    "page_nums": chuck.page_nums
                },
            }
        })
        promises.push(p)


        chuck.lines.forEach(l => {
            const p = prisma.chunk_lines.create({
                data: {
                    id: uuidv4(),
                    content: l.str,
                    chunk_id: puuid,
                    rect_info: l.rect,
                    origin_info: l,
                    attribute: {},
                }
            })

            promises.push(p)
        })


    })

    // const ids = await Promise.all(promises)
    console.log('finished')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })