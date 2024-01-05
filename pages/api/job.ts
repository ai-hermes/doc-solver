import type { NextApiRequest, NextApiResponse } from 'next';
import { getQueue } from './embedding';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { jobId } = req.body;
    const queue = getQueue();
    const job = await queue.getJob(jobId)
    if (!job) {
        res.status(200).json({ message: 'job not found' })
        return
    }
    res.status(200).json({
        jobId: job.id,
        status: job.status,
        // progress: job.progress,
    })
}