import { Icons } from "@/components/shared/icons";
import moment from 'moment-timezone';
import { Document } from '@/types/document';
import { useRouter } from "next/router";

type DocumentItemProps = Document;

export function DocumentItem({...props}: DocumentItemProps) {
    const {id, show_name, created_at} = props
    const router = useRouter()

    return (
        <div 
            key={id} 
            className="overflow-hidden p-3 border-t hover:bg-slate-100" 
            onClick={() => router.push(`/chat/${id}`)}
        >
            <div className="flex items-center text-base font-semibold">
                <Icons.pdf className="w-5 mr-0.5 shrink-0"></Icons.pdf>
                {show_name}
            </div>
            <div>{moment(created_at).format()}</div>
        </div>
    )
}