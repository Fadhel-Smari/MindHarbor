import { api } from './axios';

export async function registerUser(credentials: { email: string; password: string; pseudo?: string }) {
  await api.post('/auth/register', credentials);
}

export async function loginUser(credentials: { email: string; password: string }) {
  await api.post('/auth/login', credentials);
}