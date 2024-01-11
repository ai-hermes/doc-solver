import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { env } from 'env.mjs';
import { ChatOpenAIType, OpenAIEmbeddingsType } from '@/types/common';
import { getRedisUrl } from '@/lib/clients/redis';

const extraCfg = {
    apiKey: env.OPENAI_API_KEY,
    basePath: env.OPENAI_BASE,
}

/** get embedding client */
let embeddings: OpenAIEmbeddings;
export function getOpenAIEmbeddings() {
    if (embeddings) return embeddings

    const embeddingBaseCfg: OpenAIEmbeddingsType = {
        modelName: env.EMBEDDING_MODEL_NAME,
    }
    embeddings = new OpenAIEmbeddings(embeddingBaseCfg, extraCfg);
    if (env.EMBEDDING_BATCHSIZE) {
        embeddingBaseCfg.batchSize = env.EMBEDDING_BATCHSIZE
    }
    return embeddings
}

/** get chat client */
let chat: ChatOpenAI;
export function getOpenAIChat(): ChatOpenAI {
    if (chat) return chat

    const chatBaseCfg: ChatOpenAIType = {
        modelName: env.CHAT_MODEL_NAME,
        temperature: 0,
        // verbose: true,
    }
    chat = new ChatOpenAI(chatBaseCfg, extraCfg);
    return chat
}

/* Ensure our chat history is always passed in as a string */
export const serializeChatHistory = (chatHistory: string | Array<string>) => {
    if (Array.isArray(chatHistory)) {
        return chatHistory.join("\n");
    }
    return chatHistory;
};

export function getBufferMemory(chatId: string, memoryKey = 'chat_history') {
    const memory = new BufferMemory({
        memoryKey,
        chatHistory: new RedisChatMessageHistory({
            sessionId: chatId, // Or some other unique identifier for the conversation
            sessionTTL: 43200, // 1 month 30 * 24 * 60, omit this parameter to make sessions never expire
            url: getRedisUrl(), // Default value, override with your own instance's URL
        })
    });
    return memory;
}