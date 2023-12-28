/**
 * extra SSE JSON data from raw string, return the data and whether it is SSE data
 */
const JSONObjectsRegExp = /{[\s\S]+?}(?=data:|$)/g
export function extractSSEData(data: string): {
    data: Array<string>;
    isSSEData: boolean;
} {
    if (!data) {
        return {
            data: [],
            isSSEData: false
        }
    }
    const matches = data.match(JSONObjectsRegExp)

    return {
        data: matches || [],
        isSSEData: !!matches
    }
}


const prompt = () => {
    const defaultInput = `You are a chat bot. Please return all responses in Markdown.`

    return { role: 'system', content: defaultInput }
}

export const combinePrompts = (
    prevConversationContext: { role: string, content: string }[],
    userInput: string
) => {
    const userPrompt = { role: 'user', content: userInput }
    if (prevConversationContext.length === 0) {
        const sysPrompt = prompt()

        return [
            sysPrompt,
            userPrompt
        ]
    }
    return [
        ...prevConversationContext,
        userPrompt
    ]
}