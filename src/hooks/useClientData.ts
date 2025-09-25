// hooks/useClientData.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Client } from '@/lib/types/client';

export const useClientData = (token: string | null) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await api.clients.fetchClients(token);
      const clientData: Client[] = Array.isArray(response) ? response : response || [];
      setClients(clientData);
      return clientData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createClient = useCallback(async (clientData: any) => {
    if (!token) return;
    
    const response = await api.clients.createClient(clientData, token);
    await fetchClients(); // Refresh data
    return response;
  }, [token, fetchClients]);

  const updateClient = useCallback(async (id: number, clientData: any) => {
    if (!token) return;
    console.log(clientData)
    const response = await api.clients.updateClient(id, clientData, token);
    await fetchClients(); // Refresh data
    return response;
  }, [token, fetchClients]);

  const deleteClient = useCallback(async (id: number) => {
    if (!token) return;
    
    const response = await api.clients.deleteClient(id, token);
    await fetchClients(); // Refresh data
    return response;
  }, [token, fetchClients]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  };
};