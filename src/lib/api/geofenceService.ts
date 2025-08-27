import { Geofence } from '../types/geofence';
import { fetchWithAuth } from './apiBase';

export const api = {
  
  geofence: {
    fetchAll: async (token: string): Promise<Geofence[]> => {
      const response = await fetchWithAuth<Geofence[]>('/geofences', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data || [];
    },
    
    create: async (data: Omit<Geofence, 'id'>, token: string): Promise<Geofence> => {
      const response = await fetchWithAuth<Geofence>('/geofences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return response.data!;
    },
    
    update: async (id: number, data: Partial<Geofence>, token: string): Promise<Geofence> => {
      const response = await fetchWithAuth<Geofence>(`/geofences/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return response.data!;
    },
    
    delete: async (id: number, token: string): Promise<void> => {
      await fetchWithAuth(`/geofences/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
  }
};