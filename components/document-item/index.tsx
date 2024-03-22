import { Icons } from "@/components/shared/icons";
import moment from 'moment-timezone';
import { Document } from '@/types/document';
import { useRouter } from "next/router";
import styles from './index.module.css';
import { cn } from "@/lib/utils"

type DocumentItemProps = Document;

export function DocumentItem({...props}: DocumentItemProps) {
    const {id, show_name, created_at} = props
    const router = useRouter()
    const documentId = router.query.documentId as string

    return (
        <div 
            key={id} 
            className={cn(
                'overflow-hidden p-3 border-t hover:bg-slate-100', 
                documentId === id && 'bg-slate-100'
            )} 
            onClick={() => router.push(`/chat/${id}`)}
        >
            <div className={`flex items-center text-base font-semibold`}>
                <Icons.pdf className="w-5 mr-0.5 shrink-0"></Icons.pdf>
                <div className={`${styles.ellipsis}`}>{show_name}</div>
            </div>
            <div className={styles.ellipsis}>{moment(created_at).format()}</div>
        </div>
    )
}
