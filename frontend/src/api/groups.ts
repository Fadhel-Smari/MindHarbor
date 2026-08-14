import { api } from './axios';
import type { Paginated, Group, Post, GroupMember, StatutReqGroupe } from '../types';


export async function afficheGroupes(page = 1, limit = 20, q?: string): Promise<Paginated<Group>> {
    const { data } = await api.get<Paginated<Group>>('/groups', {
        params: { page, limit, q },
    });
    return data;
}

export async function creeGroupe(groupData: Partial<Group>): Promise<Group> {
    const { data } = await api.post<Group>('/groups', groupData);
    return data;
}

export async function afficheGroupeParId(id: string): Promise<Group> {
    const { data } = await api.get<Group>(`/groups/${id}`);
    return data;
}

export async function rejointGroupe(id: string): Promise<{ message: string; membre?: GroupMember }> {
    const { data } = await api.post(`/groups/${id}/join`);
    return data;
}

export async function afficheDemandesGroupe(id: string): Promise<GroupMember[]> {
    const { data } = await api.get<GroupMember[]>(`/groups/${id}/requests`);
    return data;
}

export async function modifieDemandeGroupe(groupId: string, requestId: string, statut: StatutReqGroupe): Promise<GroupMember> {
    const { data } = await api.patch<GroupMember>(`/groups/${groupId}/requests/${requestId}`, { statut });
    return data;
}

export async function supprimeMembreGroupe(groupId: string, userId: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/groups/${groupId}/members/${userId}`);
    return data;
}

export async function affichePublicationsGroupe(groupId: string, page = 1, limit = 20): Promise<Paginated<Post>> {
    const { data } = await api.get<Paginated<Post>>(`/groups/${groupId}/posts`, {
        params: { page, limit },
    });
    return data;
}

export async function creePublicationGroupe(groupId: string, contenu: string): Promise<Post> {
    const { data } = await api.post<Post>(`/groups/${groupId}/posts`, { contenu });
    return data;
}