import { useQuery } from "@tanstack/react-query";
import { z } from "zod"

// Document type should follow the schema from the database
export const documentSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    object_key: z.string(),
    show_name: z.string(),
    index_name: z.string(),
    task_id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    // delete_at: z.null().or(z.string()),
})


export function useDocumentDetail(documentId: string) {
    const { data: document, isLoading, isError } = useQuery({
        queryKey: ['document', documentId],
        queryFn: async () => {
            const res = await fetch(`/api/document/${documentId}`);
            const json = await res.json();
            return json.data;
        }
    })
    return {
        document: document as Document,
        isLoading,
        isError,
    }
}

export function useDocumentList() {
    // get document owned by logined user
    const { data: documents = [], isLoading, isError } = useQuery({
        queryKey: ['documents'],
        staleTime: 1000 * 5, // 5s
        queryFn: async () => {
            const res = await fetch(`/api/documents`);
            const json = await res.json();
            return json.data;
        }
    })
    return {
        documents: documents as Document[],
        isLoading,
        isError
    }
}