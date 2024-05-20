import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrismaClient } from '@/lib/clients/prisma';
import { checkLogin } from './user';

const defaultUserId = '0000000000000000000000000';

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
    let userId = '';
    if (!isLogin) {
        userId = defaultUserId
    } else {
        userId = user!.id;
    }
    console.log('userId', userId)
    try {
        switch (req.method) {
            case 'GET': {
                let documents = await getDocumentsByUser(userId);
                if(!documents?.length) {
                    documents = await getDocumentsByUser(defaultUserId)
                } 
                return res.status(200).json({
                    code: 200,
                    data: documents
                })
            }
            case 'DELETE': {
                if (!isLogin) {
                    res.status(401).send('Unauthorized')
                    return
                }
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
