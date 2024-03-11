import { useDocumentList } from '@/hooks/use-document';
import { DocumentItem } from '../document-item';

interface DocumentListProps {
    
}

export function DocumentList({}: DocumentListProps) {
    const { documents } = useDocumentList()

    return (
        <>
            {documents.map(item => (
                <DocumentItem key={item.id} {...item}/>
            ))}
        </>
    )
}