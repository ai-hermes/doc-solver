import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import _ from 'lodash';
import { prisma } from '@/utils/prisma';
import { Message } from '@/types/chat';
import { Document } from 'langchain/document';
import { NextApiRequest, NextApiResponse } from "next";

export async function getHistoryData() {
    // const indexName = "Test10";
    const uId = '123';
    const documentId = 'd6db6fd34c5ea56fa1dc8f55df17830e';
    const chatId = `${uId}_${documentId}`
    const memory = new BufferMemory({
        memoryKey: "chat_history",
        chatHistory: new RedisChatMessageHistory({
            sessionId: chatId, // Or some other unique identifier for the conversation
            sessionTTL: 43200, // 1 month 30 * 24 * 60, omit this parameter to make sessions never expire
            url: 'redis://:docsolver123456@192.168.10.6:6379/0', // Default value, override with your own instance's URL
        })
    });
    // // const memoryResult = await memory.loadMemoryVariables({})
    const historyMessages = await memory.chatHistory.getMessages()
    const hsList = historyMessages.map(item => item.lc_kwargs['hs']).filter(Boolean)
    const hsDataList = await prisma.highlights.findMany({
        where: {
            id: {
                in: hsList
            }
        }
    })

    type HighlightType = typeof hsDataList[number];
    const hsDataMap = hsDataList.reduce((p, c) => {
        p[c.id] = c;
        return p
    }, {} as Record<string, HighlightType>)

    const messages = historyMessages.map(item => {
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
    }).filter(Boolean) as Message[]
    return messages;
}

export default async function handler(
    req: NextApiRequest,
    resp: NextApiResponse,
) {


    // console.log('messages', messages)
    // console.log('memoryResult\n', z)

    /*
    const redisClient = getRedisClient()
    const str = await redisClient.lindex(chatId, 0)
    console.log('getRedisClient', str)
    const data = JSON.parse(str || '{}')
    _.set(data, 'data.hs', "1111")
    
    redisClient.lset(chatId, 0, JSON.stringify(data))
    const memory = new BufferMemory({
        memoryKey: "chat_history",
        chatHistory: new RedisChatMessageHistory({
            sessionId: chatId, // Or some other unique identifier for the conversation
            sessionTTL: 43200, // 1 month 30 * 24 * 60, omit this parameter to make sessions never expire
            url: 'redis://:docsolver123456@192.168.10.6:6379/0', // Default value, override with your own instance's URL
        })
    });
    // const memoryResult = await memory.loadMemoryVariables({})
    const z = await memory.chatHistory.getMessages()
    console.log('memoryResult\n', z)
    */
    const messages = await getHistoryData()
    resp.status(200).json(messages);
}
