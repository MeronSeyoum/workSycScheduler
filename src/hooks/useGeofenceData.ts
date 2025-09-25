// hooks/useGeofenceData.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Geofence } from '@/lib/types/geofence';

export const useGeofenceData = (token: string | null) => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGeofences = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await api.geofence.api.geofence.fetchAll(token);
      setGeofences(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

    useEffect(() => {
    fetchGeofences();
  }, [fetchGeofences]);
  
  const createGeofence = useCallback(async (geofenceData: any) => {
    if (!token) return;
    
    const response = await api.geofence.api.geofence.create(geofenceData, token);
    await fetchGeofences(); // Refresh data
    return response;
  }, [token, fetchGeofences]);

  const updateGeofence = useCallback(async (id: number, geofenceData: any) => {
    if (!token) return;
    
    const response = await api.geofence.api.geofence.update(id, geofenceData, token);
    await fetchGeofences(); // Refresh data
    return response;
  }, [token, fetchGeofences]);

  const deleteGeofence = useCallback(async (id: number) => {
    if (!token) return;
    
    const response = await api.geofence.api.geofence.delete(id, token);
    await fetchGeofences(); // Refresh data
    return response;
  }, [token, fetchGeofences]);

  return {
    geofences,
    loading,
    fetchGeofences,
    createGeofence,
    updateGeofence,
    deleteGeofence
  };
};