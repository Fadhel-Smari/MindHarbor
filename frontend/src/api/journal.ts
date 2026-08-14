import { api } from './axios';
import type { JournalEntry, Paginated } from '../types';

export async function getJournal(page = 1, limit = 20): Promise<Paginated<JournalEntry>> {
    const { data } = await api.get<Paginated<JournalEntry>>('/journal', {
        params: { page, limit },
    });
    return data;
}

export async function createJournalEntry(entryData: Partial<JournalEntry>): Promise<JournalEntry> {
    const { data } = await api.post<JournalEntry>('/journal', entryData);
    return data;
}

export async function getJournalByDate(date: string): Promise<JournalEntry> {
    const { data } = await api.get<JournalEntry>(`/journal/${date}`);
    return data;
}

export async function updateJournalEntry(date: string, entryData: Partial<JournalEntry>): Promise<JournalEntry> {
    const { data } = await api.patch<JournalEntry>(`/journal/${date}`, entryData);
    return data;
}

export async function getJournalStats(range: string = '30d') {
    const { data } = await api.get('/journal/stats', {
        params: { range },
    });
    return data;
}