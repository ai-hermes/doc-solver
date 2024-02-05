import type { NextApiRequest, NextApiResponse } from 'next';
import { genlangPrompt } from '@/utils/makechain';
import _ from 'lodash';
import { JsonObject } from '@prisma/client/runtime/library';
import { getWeaviateClient } from '@/utils/weaviate-client';
import { getOpenAIChat, getOpenAIEmbeddings } from '@/utils/llm';
import { WeaviateStore } from 'langchain/vectorstores/weaviate';
import { ChatWithRedisMemory } from '@/utils/chatWithRedisMemory';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '@/lib/clients/redis';
import { getPrismaClient } from '@/lib/clients/prisma';
import { checkAndGetDocument } from './document/[documentId]';
import { checkLogin } from './user';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    //only accept post requests
    if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Encoding', 'none');

    const { question, language = "english", documentId } = req.body;


    const [user, isLogin] = await checkLogin(req, res)
    if (!isLogin) {
        res.status(200)
            .json({
                code: 400,
                message: `unauthorized user`
            })
        return;
    }
    for (const key of ['question', 'documentId']) {
        if (!req.body[key]) {
            res.status(200)
                .json({
                    code: 400,
                    message: `${key} is required`
                })
        }
    }

    const doc = await checkAndGetDocument(documentId)
    if (!doc) {
        res.status(200)
            .json({
                code: 400,
                message: `document not found ${documentId}`
            })
    }
    // OpenAI recommends replacing newlines with spaces for best results
    const sanitizedQuestion = question.trim().replaceAll('\n', ' ');



    try {
        const indexName = doc!.index_name;
        const uId = user?.id;
        const weaviateClient = getWeaviateClient();
        const embeddings = getOpenAIEmbeddings();
        const vectorStore = await WeaviateStore.fromExistingIndex(embeddings, {
            client: weaviateClient,
            indexName: indexName,
            textKey: 'text',
            metadataKeys: [
                'innerChunkNo',
                'pageNums',
                'chunkId',
            ]
        })
        const chatId = `${uId}_${documentId}`
        const qaClient = new ChatWithRedisMemory(
            getOpenAIChat(),
            vectorStore.asRetriever(),
            chatId
        );
        const chain = qaClient.getChain()
        if (!chain) {
            return res.status(200)
                .json({
                    code: 400,
                    message: 'Init chain failed'
                });
        }
        const qaRespStream = await chain.stream({
            question: sanitizedQuestion,
            language: genlangPrompt(language),
        })
        for await (const chunk of qaRespStream) {
            res.write(`data: ${JSON.stringify({
                type: 'msg',
                msg: chunk,
            })}\n\n`);
        }

        const sourceDocuments = qaClient.getRelavantDocs()

        const uuids = sourceDocuments.map(d => d.metadata['chunkId']).filter(Boolean);
        const prismaClient = getPrismaClient()
        const hs = await prismaClient.chunkLine.findMany({
            select: {
                rect_info: true,
                content: true,
                chunk_id: true,
                origin_info: true,
            },
            where: {
                chunk_id: {
                    in: uuids
                }
            }
        })
        const hsWithPageNumber = hs.map(h => {
            const pageNumber = (h.origin_info as JsonObject)?.['pageNumber'] as number;
            return {
                ...h,
                pageNumber,
            }
        })
        const groupedHs = _.groupBy(hsWithPageNumber, 'chunk_id');
        const sourceDocumentsWithHs = sourceDocuments.map(s => {
            return {
                ...s,
                highlight: groupedHs[s.metadata['chunkId']]
            }
        })


        const hsUuid = uuidv4();
        await prismaClient.highlight.create({
            data: {
                id: hsUuid,
                hs_data: JSON.stringify(sourceDocumentsWithHs),
            }
        })
        const redisClient = getRedisClient()
        const str = await redisClient.lindex(chatId, 0)
        const data = JSON.parse(str || '{}')
        _.set(data, 'data.hs', hsUuid)
        redisClient.lset(chatId, 0, JSON.stringify(data))

        res.write(`data: ${JSON.stringify({
            type: 'hs',
            highlights: sourceDocumentsWithHs,
        })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        res.end()
    } catch (err) {
        if (err instanceof Error) {
            console.log('error', err);
            res.status(200)
                .json({
                    code: 500,
                    message: err.message
                });
        } else {
            res.status(200).send('Unknown error');
        }
    }
}
