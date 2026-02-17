export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    user_avatar?:string;
    user_id: number | null;
    role_id: number | null;
    is_global: boolean;
    download_url?: string;
    read_at: string | null;
    created_at: string;
}

export interface NotificationMetadata {
    page: number;
    size: number;
    total: number;
    unread_count: number;
}