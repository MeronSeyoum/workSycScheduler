// src/services/qrcodeService.ts
import { fetchWithAuth } from './apiBase';
import { QRCode, QRCodeValidationResponse } from "../types/qrcode";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export const fetchQRCodes = async (
  token: string, 
  options: {
    page?: number;
    limit?: number;
    includeExpired?: boolean;
  } = {}
): Promise<PaginatedResponse<QRCode>> => {
  const { page = 1, limit = 10, includeExpired = false } = options;
  
  const response = await fetchWithAuth<PaginatedResponse<QRCode>>('/qrcodes', {
    method: 'GET',
    query: {
      page: page.toString(),
      limit: limit.toString(),
      include_expired: includeExpired.toString()
    }
  }, token);
console.log("Qrcode from service ",response)

  return response.data ?? { data: [], total: 0 };
};


export const getQRCodeById = async (id: number, token: string): Promise<QRCode> => {
  const response = await fetchWithAuth<QRCode>(`/qrcodes/${id}`, {
    method: 'GET',
  }, token);
  return response.data!;
};

export const createQRCode = async (
  qrCodeData: { client_id: number; expires_at?: Date },
  token: string 
): Promise<QRCode> => {
  const payload = {
    ...qrCodeData,
    expires_at: qrCodeData.expires_at?.toISOString()
  };

  const response = await fetchWithAuth<QRCode>('/qrcodes', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
  return response.data!;
};

export const updateQRCode = async (
  id: number, 
  qrCodeData: { expires_at?: Date },
  token: string
): Promise<QRCode> => {
  const payload = {
    ...qrCodeData,
    expires_at: qrCodeData.expires_at?.toISOString()
  };

  const response = await fetchWithAuth<QRCode>(`/qrcodes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, token);
  return response.data!;
};

export const deleteQRCode = async (id: number, token: string): Promise<void> => {
  await fetchWithAuth(`/qrcodes/${id}`, {
    method: 'DELETE',
  }, token);
};

// src/services/qrcodeService.ts

export const downloadQRCode = async (id: number, token: string): Promise<Blob> => {
  const response = await fetchWithAuth<Blob>(`/qrcodes/${id}/download`, {
    method: 'GET',
    responseType: 'blob',
    headers: {
      'Accept': 'image/png',
    },
  }, token);

  if (!response.data) {
    throw new Error('Failed to download QR code');
  }

  return response.data;
};
export const validateQRCode = async (
  codeValue: string, 
  token: string
): Promise<QRCodeValidationResponse> => {
  const response = await fetchWithAuth<QRCodeValidationResponse>('/qrcodes/validate', {
    method: 'POST',
    body: JSON.stringify({ code_value: codeValue }),
  }, token);
  return response.data!;
};

export const getQRCodesByClient = async (
  clientId: number, 
  token: string
): Promise<QRCode[]> => {
  const response = await fetchWithAuth<QRCode[]>(`/qrcodes/client/${clientId}`, {
    method: 'GET',
  }, token);
  return response.data || [];
};