import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate } from 'langchain/prompts';
import { RunnableSequence } from 'langchain/schema/runnable';
import { StringOutputParser } from 'langchain/schema/output_parser';
import type { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import 'dotenv/config';
import { ChatOpenAIType, OpenAIEmbeddingsType } from '@/types/common';

const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;

const QA_TEMPLATE = `You are an expert researcher. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context or chat history, politely respond that you are tuned to only answer questions that are related to the context.
I am not sure which language the following question is in. If the user asked the question in Chinese, please return the keywords in Chinese. If the user asked the question in English, please return the keywords in English.
Respond in the same language as the question asked.

<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}
Helpful answer in markdown:`;

const chatBaseCfg: ChatOpenAIType = {
    modelName: process.env.CHAT_MODEL_NAME,
    temperature: 0,
}

const extraCfg = {
    apiKey: process.env.OPENAI_API_KEY,
    basePath: process.env.OPENAI_BASE,
}
const embeddingBaseCfg: OpenAIEmbeddingsType = {
    modelName: process.env.EMBEDDING_MODEL_NAME,
}
if (process.env.EMBEDDING_BATCHSIZE) {
    embeddingBaseCfg.batchSize = parseInt(process.env.EMBEDDING_BATCHSIZE, 10)
}
const combineDocumentsFn = (docs: Document[], separator = '\n\n') => {
    const serializedDocs = docs.map((doc) => doc.pageContent);
    return serializedDocs.join(separator);
};
async function main() {
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings(embeddingBaseCfg, extraCfg),
        {
            pineconeIndex: index,
            textKey: 'text',
            // namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
        },
    );
    // Use a callback to get intermediate sources from the middle of the chain
    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
        resolveWithDocuments = resolve;
    });
    const retriever = vectorStore.asRetriever({
        callbacks: [
            {
                handleRetrieverEnd(documents) {
                    resolveWithDocuments(documents);
                },
            },
        ],
    });


    const condenseQuestionPrompt = ChatPromptTemplate.fromTemplate(CONDENSE_TEMPLATE);
    const answerPrompt = ChatPromptTemplate.fromTemplate(QA_TEMPLATE);
    const model = new ChatOpenAI(chatBaseCfg, extraCfg);

    // Rephrase the initial question into a dereferenced standalone question based on
    // the chat history to allow effective vectorstore querying.
    const standaloneQuestionChain = RunnableSequence.from([
        condenseQuestionPrompt,
        model,
        new StringOutputParser(),
    ]);

    // Retrieve documents based on a query, then format them.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const retrievalChain = retriever.pipe(combineDocumentsFn as any);

    // Generate an answer to the standalone question based on the chat history
    // and retrieved documents. Additionally, we return the source documents directly.
    const answerChain = RunnableSequence.from([
        {
            context: RunnableSequence.from([
                (input) => input.question,
                retrievalChain,
            ]),
            chat_history: (input) => input.chat_history,
            question: (input) => input.question,
        },
        answerPrompt,
        model,
        new StringOutputParser(),
    ]);

    // First generate a standalone question, then answer it based on
    // chat history and retrieved context documents.
    const conversationalRetrievalQAChain = RunnableSequence.from([
        {
            question: standaloneQuestionChain,
            chat_history: (input) => input.chat_history,
        },
        answerChain,
    ]);

    // const qaResp = await conversationalRetrievalQAChain.invoke({
    //     question: '什么是raft协议, 和paxos协议有什么区别?',
    //     chat_history: '',
    // })
    // console.log(qaResp)
    const qaRespStream = await conversationalRetrievalQAChain.stream({
        question: '什么是raft协议, 和paxos协议有什么区别?',
        chat_history: '',
    })
    for await (const chunk of qaRespStream) {
        // console.log(chunk);
        process.stdout.write(chunk);
    }
    console.log()


    const sourceDocuments = await documentPromise;
    sourceDocuments.forEach(sourceDocument => {
        console.log('==========[start]')
        console.log(sourceDocument.pageContent)
        console.log('==========[end]')
    })
};

main();