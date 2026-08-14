export type Meta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type Paginated<T> = {
    data: T[];
    meta: Meta;
};

export type JournalEntry = {
    id: string;
    userId: string;
    date: string; // or Date if you parse it
    mood: number;
    energy: number;
    sleep: number;
    anxiety: number;
    events?: string;
    gratitude?: string;
    createdAt: string;
    updatedAt: string;
};