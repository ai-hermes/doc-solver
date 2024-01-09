import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatOpenAIType, OpenAIEmbeddingsType } from '@/types/common';

const extraCfg = {
    apiKey: process.env.OPENAI_API_KEY,
    basePath: process.env.OPENAI_BASE,
}

/** get embedding client */
let embeddings: Nullable<OpenAIEmbeddings> = null;
export function getOpenAIEmbeddings() {
    if (embeddings) return embeddings

    const embeddingBaseCfg: OpenAIEmbeddingsType = {
        modelName: process.env.EMBEDDING_MODEL_NAME,
    }
    embeddings = new OpenAIEmbeddings(embeddingBaseCfg, extraCfg);
    if (process.env.EMBEDDING_BATCHSIZE) {
        embeddingBaseCfg.batchSize = parseInt(process.env.EMBEDDING_BATCHSIZE, 10)
    }
    return embeddings
}

/** get chat client */
let chat: Nullable<ChatOpenAI> = null;
export function getOpenAIChat(): ChatOpenAI {
    if (chat) return chat

    const chatBaseCfg: ChatOpenAIType = {
        modelName: process.env.CHAT_MODEL_NAME,
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