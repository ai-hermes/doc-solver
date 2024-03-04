import { Icons } from "@/components/shared/icons";
import moment from 'moment-timezone';
import { Document } from '@/types/document';

type DocumentItemProps = Document;

export default function DocumentItem({...props}: DocumentItemProps) {
    const {id, show_name, created_at} = props
    return (
        <div key={id} className="overflow-hidden p-3">
            <div className="flex items-center text-base font-semibold">
                <Icons.pdf className="w-5 mr-0.5 shrink-0"></Icons.pdf>
                {show_name}
            </div>
            <div>{moment(created_at).format()}</div>
        </div>
    )
}