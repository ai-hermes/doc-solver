import { useQuery } from "@tanstack/react-query";
import { Message } from "@/types/chat";

export function useChatHistory(documentId: string) {
    const { data: messages, isLoading, isError } = useQuery({
        queryKey: ['history', documentId],
        queryFn: async () => {
            const res = await fetch(`/api/history?documentId=${documentId}`);
            const json = await res.json();
            return json.data;
        }
    })
    return {
        messages: messages as Message[],
        isLoading,
        isError,
    }
}