// src/services/userService.ts
import { fetchWithAuth } from './apiBase';
import { User } from "@/types/user";

export const fetchUsers = async (token: string): Promise<User[]> => {
  const response = await fetchWithAuth<User[]>('/users', {
    method: 'GET',
  }, token);
  return response.data || [];
};

export const getUserById = async (id: number, token: string): Promise<User> => {
  const response = await fetchWithAuth<User>(`/users/${id}`, {
    method: 'GET',
  }, token);
  return response.data!;
};

export const createUser = async (userData: Omit<User, 'id'>, token: string): Promise<User> => {
  const response = await fetchWithAuth<User>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }, token);
  return response.data!;
};

export const updateUser = async (id: number, userData: Partial<User>, token: string): Promise<User> => {
  const response = await fetchWithAuth<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }, token);
  return response.data!;
};

export const deleteUser = async (id: number, token: string): Promise<void> => {
  await fetchWithAuth(`/users/${id}`, {
    method: 'DELETE',
  }, token);
};

export const updateUserPassword = async (id: number, passwordData: { 
  currentPassword: string, 
  newPassword: string 
}, token: string): Promise<void> => {
  await fetchWithAuth(`/users/${id}/password`, {
    method: 'PATCH',
    body: JSON.stringify(passwordData),
  }, token);
};

export const resetUserPassword = async (id: number, token: string): Promise<void> => {
  await fetchWithAuth(`/users/${id}/reset-password`, {
    method: 'POST',
  }, token);
};

export const updateUserStatus = async (id: number, status: 'active' | 'inactive' | 'suspended', token: string): Promise<User> => {
  const response = await fetchWithAuth<User>(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, token);
  return response.data!;
};

export const updateUserRole = async (id: number, role: 'admin' | 'manager' | 'employee', token: string): Promise<User> => {
  const response = await fetchWithAuth<User>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  }, token);
  return response.data!;
};

