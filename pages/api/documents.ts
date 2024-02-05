import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrismaClient } from '@/lib/clients/prisma';
import { checkLogin } from './user';


async function getDocumentsByUser(userId: string) {
    return getPrismaClient().document.findMany({
        where: {
            user_id: userId,
            deleted_at: null
        },
        include: {
            task: true
        }
    })
}

async function deleteDocuments(documentIds: string[]) {
    return getPrismaClient().document.deleteMany({
        where: {
            id: {
                in: documentIds
            }
        }
    })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const [user, isLogin] = await checkLogin(req, res)
    if (!isLogin) {
        res.status(401).send('Unauthorized')
        return
    }
    const userId = user!.id;
    try {
        switch (req.method) {
            case 'GET': {
                const documents = await getDocumentsByUser(userId);
                return res.status(200).json({
                    code: 200,
                    data: documents
                })
            }
            case 'DELETE': {
                const documentIds = req.body.ids as string[];
                if (!documentIds || documentIds.length === 0) {
                    res.status(200).json({
                        code: 500,
                        message: `documentId is required`
                    })
                }
                await deleteDocuments(documentIds)
                res.status(200).json({
                    code: 200,
                    message: `documents deleted ${documentIds}`
                })
            }
            default:
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (e) {
        if (e instanceof Error) {
            res.status(200).json({
                code: 500,
                message: e.message
            })
        } else {
            res.status(200).json({
                code: 500,
                message: 'Unknown error'
            })
        }
    }
}