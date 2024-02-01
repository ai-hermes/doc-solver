import type { NextApiRequest, NextApiResponse } from 'next';
import { IngestQueue } from '@/jobs/queues/ingest';

export function sleep(n: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null)
        }, n * 1000)
    })
}


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { pdfUrl, pdfMd5Key } = req.body;
    console.log({ pdfUrl, pdfMd5Key })
    // const indexName = `Doc${pdfMd5Key}`
    const indexName = `Index_${pdfMd5Key.replace('pdf/', '')}`
    const queue = IngestQueue.getQueue()
    const job = await queue
        .createJob({
            source: 'raft.pdf',
            indexName: indexName,
            pdfUrl: pdfUrl,
            pdfMd5Key: pdfMd5Key,
        })
        .save()
    // const job = await queue.createJob({
    //     pdfUrl,
    //     pdfMd5Key,
    // }).save()
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