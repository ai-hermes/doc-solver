import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrismaClient } from '@/lib/clients/prisma';
import { checkLogin } from './user';

async function getJobsByUser(userId: string) {
    const prisma = getPrismaClient()
    const tasks = await prisma.task.findMany({
        where: {
            user_id: userId
        },
        orderBy: {
            'created_at': 'desc'
        },
        select: {
            id: true,
            user_id: true,
            task_type: true,
            task_name: true,
            task_status: true,
            bq_id: true,
        }
    })
    return tasks;
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
                const tasks = await getJobsByUser(userId)
                res.status(200).json({
                    code: 200,
                    data: tasks
                })
            }
            default:
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