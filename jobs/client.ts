import { TestQueue } from './queues/test';

async function main() {

    const queue = TestQueue.getQueue()
    await queue
        .createJob({
            pdfUrl: 'string',
            pdfMd5Key: 'string'
        })
        .save()
}

main()
    .catch(console.error)
    .finally(() => {
        process.exit(0)
    })