import { NextApiRequest, NextApiResponse } from 'next'
import { getPrismaClient } from '@/lib/clients/prisma'
import { Document } from '@/types/document'
import { checkLogin } from '../user'


export async function checkDocumentExist(documentId: string): Promise<boolean> {
    const prismaClient = getPrismaClient()
    let isDocumentExist = false
    try {
        const cnt = await prismaClient.document.count({
            where: {
                id: documentId
            }
        })
        isDocumentExist = cnt > 0
    } catch (e) {

    }
    return isDocumentExist
}

export async function checkAndGetDocument(documentId: string): Promise<Document | null> {
    const prismaClient = getPrismaClient()
    let doc: Document | null = null
    try {
        doc = await prismaClient.document.findFirst({
            where: {
                id: documentId
            }
        })
    } catch (e) {

    }
    return doc
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { documentId } = req.query
    const [_, isLogin] = await checkLogin(req, res)
    if (!isLogin && documentId !== '00000000-0000-0000-0000-000000000000') {
        res.status(401).send('Unauthorized')
        return
    }
    try {
        switch (req.method) {
            case 'GET': {
                if (!documentId) {
                    return res.status(200).json({
                        code: 400,
                        message: 'documentId is required'
                    })
                }
                const doc = await checkAndGetDocument(documentId as string)
                if (!doc) {
                    res.status(200).json({
                        code: 400,
                        message: `document not found ${documentId}`
                    })
                } else {
                    res.status(200).json({
                        code: 200,
                        data: doc
                    })
                }
            }
            default:
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (e) {
        if (e instanceof Error) {
            res.status(500).json({
                code: 500,
                message: e.message
            })
        } else {
            res.status(500).json({
                code: 500,
                message: 'unknown error'
            })
        }
    }
}
