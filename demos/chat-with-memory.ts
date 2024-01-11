import { ConversationSummaryMemory } from "langchain/memory";
// import { chatBaseCfg, extraCfg } from '@/config/openai';
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { getOpenAIChat } from "@/lib/clients/llm";


// const client = new Redis({
//     host: "localhost",
//     port: 6379,
//     db: 0,
//     password: 'docsolver123456',
// });



async function main() {
    const model = getOpenAIChat();
    // const model = new ChatOpenAI(chatBaseCfg, extraCfg);
    const memory = new ConversationSummaryMemory({
        memoryKey: "chat_history",
        llm: model,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prompt: any = PromptTemplate.fromTemplate(`The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

  Current conversation:
  {chat_history}
  Human: {input}
  AI:`);
    const chain = new LLMChain({ llm: model, prompt, memory });

    const res1 = await chain.call({ input: "Hi! I'm Jim." });
    console.log({ res1, memory: await memory.loadMemoryVariables({}) });

    /*
    // const memory = new BufferMemory({
    //     chatHistory: new RedisChatMessageHistory({
    //         sessionId: '1111-2222-3333-4444',
    //         sessionTTL: 300,
    //         client,
    //     }),
    // });
    const memory = new BufferMemory({
        chatHistory: new RedisChatMessageHistory({
            sessionId: '1111-2222-3333-4444',
            sessionTTL: 300,
            client,
        }),
    });
    const chain = new ConversationChain({ llm: model, memory });
    // const res1 = await chain.call({ input: "Hi! I'm Jim." });
    // console.log({ res1 });
    const res2 = await chain.call({ input: "What did I just say my name was?" });
    console.log({ res2 });
    // const chain = new ConversationChain({ llm: model, memory });
    // const res = await chain.call({ input: "Help me write a short self-introduction, i like playing basketball" });
    // console.log({res})
    */
};

main().catch(console.error).finally(() => process.exit(0))