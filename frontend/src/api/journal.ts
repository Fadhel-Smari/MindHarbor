import { api } from './axios';
import type { JournalEntry, Paginated } from '../types';

export async function getJournal(page = 1): Promise<Paginated<JournalEntry>> {
    const { data } = await api.get<Paginated<JournalEntry>>('/journal', {
        params: { page, limit: 20 },
    });
    return data;
}

export async function createEntreeJournal(dataEntree: Partial<JournalEntry>): Promise<JournalEntry> {
    const { data } = await api.post<JournalEntry>('/journal', dataEntree);
    return data;
}

export async function getJournalParDate(date: string): Promise<JournalEntry> {
    const { data } = await api.get<JournalEntry>(`/journal/${date}`);
    return data;
}

export async function updateEntreeJournal(date: string, dataEntree: Partial<JournalEntry>): Promise<JournalEntry> {
    const { data } = await api.patch<JournalEntry>(`/journal/${date}`, dataEntree);
    return data;
}

export async function getJournalStats(range: string = '30d') {
    const { data } = await api.get('/journal/stats', {
        params: { range },
    });
    return data;
}