import { api } from './axios';
import type { RegisterCredentials, LoginCredentials } from '../types';

export async function registerUser(credentials: RegisterCredentials) {
  const { data } = await api.post('/auth/register', credentials);
  return data;
}

export async function loginUser(credentials: LoginCredentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data; // <--- C'est LUI qui ramène le token à Connexion.tsx !
}