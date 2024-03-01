import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrismaClient } from '@/lib/clients/prisma';
import { v4 as uuidv4 } from 'uuid';
import { IngestQueue } from '@/jobs/queues/ingest';
import { checkLogin } from './user';

interface JobParams {
    source: string;
    pdfUrl: string;
    pdfMd5Key: string;
}

async function getJobDetail(
    jobId: string
) {
    const queue = IngestQueue.getQueue()
    return queue.getJob(jobId)
}

async function createJob(
    userId: string,
    source: string,
    pdfUrl: string,
    pdfMd5Key: string
) {
    const indexName = `Index_${pdfMd5Key.replace('pdf/', '')}`
    console.log('indexName', indexName)
    const prisma = getPrismaClient()
    const documentId = uuidv4();
    const taskId = uuidv4();

    try {
        const queue = IngestQueue.getQueue()
        const createJobResp = await queue.createJob({
            source,
            indexName,
            pdfUrl,
            pdfMd5Key,
            taskId
        }).save()
        console.log('createJobResp', createJobResp.id)

        await prisma.task.create({
            data: {
                id: taskId,
                user_id: userId,
                task_type: 'ingest',
                task_name: `ingest-${Date.now()}`,
                task_status: createJobResp.status,
                bq_id: createJobResp.id
            }
        })

        await prisma.document.create({
            data: {
                id: documentId,
                user_id: userId,
                object_key: pdfMd5Key,
                task_id: taskId,
                show_name: source,
                index_name: indexName
            },
        })
        return [createJobResp.id, true];
    } catch (e) {
        console.error(e)
        return ['', false,]
    }
}

async function deleteJob(
    userId: string,
    jobId: string
) {
    const prismaClient = getPrismaClient()
    try {
        await prismaClient.task.delete({
            where: {
                id: jobId,
                user_id: userId
            }
        })
        return true
    } catch (e) {
        return false
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const [user, isLogin] = await checkLogin(req, res)
    if (!isLogin) {
        res.status(401)
        return
    }
    const userId = user!.id;
    try {
        switch (req.method) {
            case 'GET': {
                const { jobId } = req.query
                if (!jobId) {
                    throw new Error('jobId is required')
                }
                const job = await getJobDetail(jobId as string)
                res.status(200).json({
                    code: 200,
                    data: {
                        jobId: job.id,
                        status: job.status,
                    }
                })
            }
            case 'POST': {
                // return POST(req, res, session.user);
                for (const key of ['source', 'pdfUrl', 'pdfMd5Key']) {
                    if (!req.body[key as keyof JobParams]) {
                        res.status(200).json({
                            code: 500,
                            message: `${key} is required`
                        })
                        return
                    }
                }
                const { source, pdfUrl, pdfMd5Key } = req.body
                const [jobId, createJobOk] = await createJob(userId, source, pdfUrl, pdfMd5Key)
                if (createJobOk) {
                    res.status(200).json({
                        code: 200,
                        data: {
                            jobId,
                        },
                        message: `creat job success`
                    })
                } else {
                    res.status(200).json({
                        code: 500,
                        message: `creat job error`
                    })
                }
            }
            case 'DELETE': {
                const { jobId } = req.body
                const deleteJobOk = await deleteJob(userId, jobId as string)
                if (deleteJobOk) {
                    res.status(200).json({
                        code: 200,
                        message: `delete job success`
                    })
                } else {
                    res.status(200).json({
                        code: 500,
                        message: `delete job error`
                    })
                }
            }
            default:
                res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (e) {
        if (e instanceof Error) {
            res.status(200)
                .json({
                    code: 500,
                    message: e.message
                })
        }
    }
}