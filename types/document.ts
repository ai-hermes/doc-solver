import { Job } from "./job";

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
    task?: Job;
}