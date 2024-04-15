import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { BufferMemory, BaseMemory } from "langchain/memory";
import { StringOutputParser } from 'langchain/schema/output_parser';
import { formatDocumentsAsString } from "langchain/util/document";


import { RunnableSequence } from "@langchain/core/runnables";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
// import { getWeaviateClient, serializeChatHistory, CONDENSE_TEMPLATE, QA_TEMPLATE, getOpenAIEmbeddings, getOpenAIChat, getLanguageTips } from './utils';
import { VectorStoreRetriever } from '@langchain/core/vectorstores'
import { DocumentInterface } from '@langchain/core/documents'
import { RunnableBranch } from "@langchain/core/runnables";
import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import { v4 as uuidv4 } from 'uuid';
import { QA_TEMPLATE, CONDENSE_TEMPLATE } from "./makechain";
import { serializeChatHistory } from "./llm";
import { Nullable } from "@/typings";
import { generateRedisUrl } from "./redis-client";
import { getPrismaClient } from "@/lib/clients/prisma";
import { PrismaClient } from "@prisma/client";


interface PromptContextData {
    question: string; // user input question
    chat_history?: string | Array<string>; // if has history array, it will be serialize to string
    context?: string; // after retriever invoke, it will search in vector store and serialize to string
    text?: string; // after model invoke, will have text
    language?: string; // only used for qaTemplate
}

export class ChatWithRedisMemory {
    private chatId: string;
    private indexName: string;
    private prismaClient: PrismaClient;
    private memory: BaseMemory;
    private qaTemplate: PromptTemplate;
    private condenseTemplate: PromptTemplate;
    private relevantDocs: DocumentInterface[] = [];
    private fullChain: Nullable<RunnableSequence> = null;
    private isDebug = true;
    constructor(
        // eslint-disable-next-line no-use-before-define
        private model: BaseChatModel = model,
        // eslint-disable-next-line no-use-before-define
        private retriever: VectorStoreRetriever = retriever,
        chatId: string = '',
        indexName: string = '',
        private qaTemplateStr: string = QA_TEMPLATE,
        private condenseTemplateStr: string = CONDENSE_TEMPLATE,
    ) {
        this.chatId = chatId || uuidv4();
        this.indexName = indexName;
        this.prismaClient = getPrismaClient()
        this.memory = new BufferMemory({
            memoryKey: "chat_history",
            chatHistory: new RedisChatMessageHistory({
                sessionId: this.chatId, // Or some other unique identifier for the conversation
                sessionTTL: 43200, // 1 month 30 * 24 * 60, omit this parameter to make sessions never expire
                url: generateRedisUrl(), // Default value, override with your own instance's URL
            })
        });

        this.qaTemplate = PromptTemplate.fromTemplate(this.qaTemplateStr);
        this.condenseTemplate = PromptTemplate.fromTemplate(this.condenseTemplateStr);
    }

    initChain() {
        const answerQuestionChain = RunnableSequence.from([
            {
                question: (input: PromptContextData) => input.question,
                chat_history: (input: PromptContextData) => serializeChatHistory(input.chat_history ?? ""),
                language: (input: PromptContextData) => input.language,
                context: async (input: PromptContextData) => {
                    // Fetch relevant docs and serialize to a string.
                    const relevantDocs = await this.retriever.getRelevantDocuments(
                        input.question
                    );
                    if (relevantDocs.length === 0) {
                        const chunks = await this.prismaClient.chunk.findMany({
                            where: {
                                attribute: {
                                    path: '$.indexName',
                                    equals: this.indexName,
                                }
                            }
                        })
                        const content = chunks
                            .sort((a, b) => {
                                const wa = (a.attribute as { innerChunkNo: number }).innerChunkNo
                                const wb = (b.attribute as { innerChunkNo: number }).innerChunkNo
                                return wa - wb
                            })
                            .map(c => {
                                return c.content
                            })
                            .join("");
                        return content.slice(0, 3000)
                    } else {
                        // store documents temporarily
                        this.relevantDocs = relevantDocs
                        const serialized = formatDocumentsAsString(relevantDocs);
                        return serialized;
                    }

                },
            },
            this.handleProcessQuery.bind(this),
        ]);

        const generateQuestionChain = RunnableSequence.from([
            {
                question: (input: PromptContextData) => input.question,
                language: (input: PromptContextData) => input.language,
                chat_history: async () => {
                    const memoryResult = await this.memory.loadMemoryVariables({});
                    // [todo][dingwenjiang] take the last 6 message
                    return serializeChatHistory(memoryResult.chat_history ?? "");
                },
            },
            // Take the result of the above model call, and pass it through to the
            // next RunnableSequence chain which will answer the question
            this.handleCondense.bind(this),
            {
                question: (previousStepResult: { text: string }) => previousStepResult.text,
                language: (input: PromptContextData) => input.language,
            },
            answerQuestionChain,
        ]);

        const branch = RunnableBranch.from([
            [
                async () => {
                    const memoryResult = await this.memory.loadMemoryVariables({});
                    const isChatHistoryPresent = !memoryResult.chat_history.length;

                    return isChatHistoryPresent;
                },
                answerQuestionChain,
            ],
            [
                async () => {
                    const memoryResult = await this.memory.loadMemoryVariables({});
                    const isChatHistoryPresent =
                        !!memoryResult.chat_history && memoryResult.chat_history.length;

                    return isChatHistoryPresent;
                },
                generateQuestionChain,
            ],
            answerQuestionChain,
        ]);

        const fullChain = RunnableSequence.from([
            {
                question: (input: PromptContextData) => input.question,
                language: (input: PromptContextData) => input.language,
            },
            branch,
        ]);
        this.fullChain = fullChain;
    }

    async handleProcessQuery(input: PromptContextData) {
        const chain = new LLMChain({
            llm: this.model,
            prompt: this.qaTemplate,
            outputParser: new StringOutputParser(),
            verbose: this.isDebug
        });

        const { text } = await chain.call({
            ...input,
            chat_history: serializeChatHistory(input.chat_history ?? ""),
        });
        await this.memory.saveContext(
            {
                human: input.question,
            },
            {
                ai: text,
            }
        );
        return text;
    }

    async handleCondense(input: PromptContextData) {
        const chain = new LLMChain({
            llm: this.model,
            prompt: this.condenseTemplate,
            outputParser: new StringOutputParser(),
            verbose: this.isDebug
        });

        const { text } = await chain.call({
            ...input,
            chat_history: serializeChatHistory(input.chat_history ?? ""),
        });
        return {
            ...input,
            text,
        };
    }

    cleanTemporarilyData() {
        this.relevantDocs = []
    }

    getChain() {
        if (!this.fullChain) {
            this.initChain()
        }
        return this.fullChain
    }
    getRelavantDocs() {
        return this.relevantDocs
    }
}
