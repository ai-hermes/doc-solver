import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from 'next-auth';
import { authOptions } from "./auth/[...nextauth]";
import _ from 'lodash';
import { Document } from 'langchain/document';
import { getBufferMemory } from '@/lib/clients/llm';
import { getPrismaClient } from '@/lib/clients/prisma';

import { Message } from '@/types/chat';
import { Highlight } from "@/types/model";

export async function getHistoryData(userId: string, documentId: string) {
    /*
    1. get auth info from cookie and get user info
    2. get document id from request, check document is exist
    3. generate chat_id
    4. load memory from redis
    5. extract highlight id list from message which type is ai
    */
    const chatId = `${userId}_${documentId}`
    const memory = getBufferMemory(chatId);

    const historyMessages = await memory.chatHistory.getMessages()
    /*
    message example:

    */
    const prisma = getPrismaClient();
    const hsList: Array<string> = historyMessages.map(item => item.lc_kwargs['hs']).filter(Boolean)
    const hsDataList = await prisma.highlight.findMany({
        where: {
            id: {
                in: hsList
            }
        }
    })

    const hsDataMap = hsDataList
        .reduce((p, c) => {
            p[c.id] = c;
            return p
        }, {} as Record<string, Highlight>)

    const messages = historyMessages
        .map(item => {
            // "human" | "ai" | "generic" | "system" | "function" | "tool";
            const hs = item.lc_kwargs['hs'];
            let hsData = null;
            if (hsDataMap[hs]) {
                hsData = JSON.parse(hsDataMap[hs].hs_data)
            }
            if (item._getType() === 'ai') {
                return {
                    type: 'apiMessage',
                    message: item.content,
                    sourceDocs: hsData as Document[],
                } as Message
            } else if (item._getType() === 'human') {
                return {
                    type: 'userMessage',
                    message: item.content,
                } as Message
            }
        })
        .filter(Boolean) as Message[]
    return messages;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {

    const session = await getServerSession(req, res, authOptions)
    const userId = session?.user.id
    if (!userId) {
        res.status(401)
        return
    }
    // [todo][dingwenjiang] extract documentId from request
    const documentId = 'd6db6fd34c5ea56fa1dc8f55df17830e';
    const messages = await getHistoryData(userId, documentId);

    res.status(200).json(messages);
}
