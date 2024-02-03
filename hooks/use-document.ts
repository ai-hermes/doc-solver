import { useQuery } from "@tanstack/react-query";

// Document type should follow the schema from the database
export interface Document {
    id: string;
    user_id: string;
    object_key: string;
    show_name: string;
    index_name: string;
    task_id: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

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