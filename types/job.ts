export interface Job {
    id: string
    user_id: string
    bq_id: string
    task_type: string
    task_name: string
    task_status: 'created' | 'successed' | 'finished'
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}