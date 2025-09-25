// utils/dashboard.ts
import { Client } from '@/lib/types/client';
import { QRCode } from '@/lib/types/qrcode';
import {  Geofence } from '@/lib/types/geofence';


export const filterClients = (
  clients: Client[],
  searchText: string,
  statusFilter: string
) => {
  return clients.filter((client) => {
    const matchesSearch =
      client.business_name.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

export const filterQRCodes = (
  qrCodes: QRCode[],
  allClients: Client[],
  searchText: string
) => {
  return qrCodes
    .map((qr) => ({
      ...qr,
      client: allClients.find((c) => c.id === qr.client_id),
    }))
    .filter((qr) => {
      const matchesSearch =
        qr.code_value.toLowerCase().includes(searchText.toLowerCase()) ||
        qr.client?.business_name?.toLowerCase().includes(searchText.toLowerCase());
      return matchesSearch;
    });
};

export const filterGeofences = (
  geofences: Geofence[],
  allClients: Client[],
  searchText: string
) => {
  return geofences.filter((geofence) => {
    const client = allClients.find((c) => c.id === geofence.client_id);
    const matchesSearch =
      client?.business_name?.toLowerCase().includes(searchText.toLowerCase()) 
      // || geofence.status.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });
};

export const calculateGeofenceCoverage = (radiusMeters: number) => {
  return Math.round(Math.PI * Math.pow(radiusMeters, 2));
};

export const getClientName = (clientId: number, clients: Client[]) => {
  const client = clients.find((c) => c.id === clientId);
  return client?.business_name || `Client ${clientId}`;
};