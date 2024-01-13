import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrismaClient } from '@/lib/clients/prisma';
import { Session, getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';


async function GET(_: NextApiRequest, res: NextApiResponse, user: Session['user']) {
    const prisma = getPrismaClient()
    const tasks = await prisma.task.findMany({
        where: {
            user_id: user.id
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
        }
    })
    res.status(200).json({
        code: 200,
        data: tasks
    })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)
    if (!session || !session.user) {
        res.status(401)
        return
    }
    switch (req.method) {
        case 'GET':
            return GET(req, res, session.user);
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}