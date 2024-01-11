import { BufferMemory, ConversationSummaryMemory, CombinedMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { getOpenAIChat } from "@/lib/clients/llm";


// const client = new Redis({
//     host: "localhost",
//     port: 6379,
//     db: 0,
//     password: 'docsolver123456',
// });



async function main() {
    // const model = new ChatOpenAI(chatBaseCfg, extraCfg);
    const model = getOpenAIChat();
    const bufferMemory = new BufferMemory({
        memoryKey: "chat_history_lines",
        inputKey: "input",
    });
    const summaryMemory = new ConversationSummaryMemory({
        llm: model,
        inputKey: "input",
        memoryKey: "conversation_summary",
    });
    const memory = new CombinedMemory({
        memories: [bufferMemory, summaryMemory],
    });

    const _DEFAULT_TEMPLATE = `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Summary of conversation:
{conversation_summary}
Current conversation:
{chat_history_lines}
Human: {input}
AI:`;
    const prompt = new PromptTemplate({
        inputVariables: ["input", "conversation_summary", "chat_history_lines"],
        template: _DEFAULT_TEMPLATE,
    });
    const chain = new LLMChain({ llm: model, prompt, memory });

    const res1 = await chain.call({ input: "Hi! I'm Jim." });
    console.log({ res1 });

    const res2 = await chain.call({ input: "Can you tell me a joke?" });
    console.log({ res2 });

    const res3 = await chain.call({
        input: "What's my name and what joke did you just tell?",
    });
    console.log({ res3 });

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