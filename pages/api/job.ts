import type { NextApiRequest, NextApiResponse } from 'next';
import { TestQueue } from '@/jobs/queues/test';
import { getPrismaClient } from '@/lib/clients/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Session, getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

interface JobParams {
    source: string;
    pdfUrl: string;
    pdfMd5Key: string;
}

interface JobNextApiRequest extends NextApiRequest {
    body: JobParams;
}
async function POST(
    req: JobNextApiRequest,
    res: NextApiResponse,
    user: Session['user']) {
    for (const key of ['source', 'pdfUrl', 'pdfMd5Key']) {
        if (!req.body[key as keyof JobParams]) {
            res.status(200).json({
                code: 500,
                message: `${key} is required`
            })
            return
        }
    }
    const { pdfUrl, pdfMd5Key } = req.body
    const indexName = `Index_${pdfMd5Key.replace('pdf/', '')}`
    console.log('indexName', indexName)

    const queue = TestQueue.getQueue()
    const prisma = getPrismaClient()

    try {
        const createJobResp = await queue.createJob({
            pdfUrl,
            pdfMd5Key
        }).save()
        console.log('createJobResp', createJobResp.id)
        await prisma.task.create({
            data: {
                id: uuidv4(),
                user_id: user.id,
                task_type: 'test',
                task_name: `test-${Date.now()}`,
                task_status: createJobResp.status,
                bq_id: createJobResp.id
            }
        })


        res.status(200).json({
            code: 200,
            data: {
                jobId: createJobResp.id,
            },
            message: `creat job success`
        })
    } catch (e) {
        res.status(200).json({
            code: 500,
            message: `creat job error: ${e}`
        })
        return
    }
}


async function GET(
    req: NextApiRequest,
    res: NextApiResponse) {
    const { id } = req.query
    if (!id) {
        res.status(200).json({
            code: 500,
            message: `jobId is required`
        })
    }
    const queue = TestQueue.getQueue()
    const job = await queue.getJob(id as string)
    if (!job) {
        res.status(200).json({
            code: 500,
            message: 'job not found'
        })
        return
    }
    res.status(200).json({
        code: 200,
        data: {
            jobId: job.id,
            status: job.status,
        }
    })

}

export default async function handler(req: JobNextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)
    if (!session || !session.user) {
        res.status(401)
        return
    }
    switch (req.method) {
        case 'GET':
            return GET(req, res);
        case 'POST':
            return POST(req, res, session.user);
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}