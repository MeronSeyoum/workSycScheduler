// src/services/clientService.ts
import { fetchWithAuth } from './apiBase';
import { Client, ClientAddress } from "@/lib/types/client";

export const fetchClients = async (token: string): Promise<Client[]> => {
  const response = await fetchWithAuth<Client[]>('/clients', {
    method: 'GET',
  }, token);
  return response.data || [];
};

export const getClientById = async (id: number, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>(`/clients/${id}`, {
    method: 'GET',
  }, token);
  return response.data!;
};

export const createClient = async (clientData: Omit<Client, 'id'>, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>('/clients', {
    method: 'POST',
    body: JSON.stringify(clientData),
  }, token);
  return response.data!;
};

export const updateClient = async (id: number, clientData: Partial<Client>, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientData),
  }, token);
  return response.data!;
};

export const deleteClient = async (id: number, token: string): Promise<void> => {
  await fetchWithAuth(`/clients/${id}`, {
    method: 'DELETE',
  }, token);
};

// Location methods
export const addClientLocation = async (clientId: number, locationData: ClientAddress, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>(`/clients/${clientId}/locations`, {
    method: 'POST',
    body: JSON.stringify(locationData),
  }, token);
  return response.data!;
};

export const updateClientLocation = async (clientId: number, locationId: string, locationData: ClientAddress, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>(`/clients/${clientId}/locations/${locationId}`, {
    method: 'PUT',
    body: JSON.stringify(locationData),
  }, token);
  return response.data!;
};

export const removeClientLocation = async (clientId: number, locationId: string, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>(`/clients/${clientId}/locations/${locationId}`, {
    method: 'DELETE',
  }, token);
  return response.data!;
};