import { api } from './axios';
import type { Resource, Paginated, ResourceFilters, Favorite } from '../types';


export async function getResources(filters?: ResourceFilters): Promise<Paginated<Resource>> {
    const { data } = await api.get<Paginated<Resource>>('/resources', {
        params: filters,
    });
    return data;
}


export async function getResourceById(id: string): Promise<Resource> {
    const { data } = await api.get<Resource>(`/resources/${id}`);
    return data;
}


export async function createResource(resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> {
    const { data } = await api.post<Resource>('/resources', resourceData);
    return data;
}


export async function addFavorite(resourceId: string): Promise<{ message: string; favori: Favorite }> {
    const { data } = await api.post<{ message: string; favori: Favorite }>(`/resources/${resourceId}/favorite`);
    return data;
}


export async function removeFavorite(resourceId: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/resources/${resourceId}/favorite`);
    return data;
}