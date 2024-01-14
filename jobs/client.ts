import { IngestQueue } from './queues/ingest';

async function main() {
    const queue = IngestQueue.getQueue()
    await queue
        .createJob({
            source: 'raft.pdf',
            indexName: 'Test11',
            pdfUrl: 'doc-solver-dev-1251009550.cos.ap-shanghai.myqcloud.com/pdf/d6db6fd34c5ea56fa1dc8f55df17830e',
            pdfMd5Key: 'pdf/d6db6fd34c5ea56fa1dc8f55df17830e',
        })
        .save()
}

main()
    .catch(console.error)
    .finally(() => {
        process.exit(0)
    })