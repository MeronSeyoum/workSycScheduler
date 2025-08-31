// src/services/authService.ts
import { fetchWithAuth } from './apiBase';
import { User } from "@/lib/types/user";

export const login = async (email: string, password: string) => {
  const response = await fetchWithAuth<{
    user: User;
    access: { token: string; expires: string };
    refresh: { token: string; expires: string };
  }>('/auth/signIn', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Debug: log the actual response
  console.log('Login API response:', response);
  
  return response;
};

export const logout = async (token: string) => {
  return fetchWithAuth('/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getCurrentUser = async (token: string) => {
  return fetchWithAuth<User>('/auth/getUser', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const refreshToken = async (refreshToken: string) => {
  return fetchWithAuth<{
    user: User;
    access: { token: string; expires: string };
    refresh: { token: string; expires: string };
  }>('/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
};

