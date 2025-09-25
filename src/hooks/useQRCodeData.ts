// hooks/useQRCodeData.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { QRCode } from '@/lib/types/qrcode';

export const useQRCodeData = (token: string | null) => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQRCodes = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await api.qrCodes.fetchQRCodes(token, {
        page: 1,
        limit: 100,
      });
      const qrCodesData = response.data || response || [];
      setQrCodes(qrCodesData);
      return qrCodesData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

    useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);
  const createQRCode = useCallback(async (qrCodeData: any) => {
    if (!token) return;
    
    const response = await api.qrCodes.createQRCode(qrCodeData, token);
    await fetchQRCodes(); // Refresh data
    return response;
  }, [token, fetchQRCodes]);

  const updateQRCode = useCallback(async (id: number, qrCodeData: any) => {
    if (!token) return;
    
    const response = await api.qrCodes.updateQRCode(id, qrCodeData, token);
    await fetchQRCodes(); // Refresh data
    return response;
  }, [token, fetchQRCodes]);

  const deleteQRCode = useCallback(async (id: number) => {
    if (!token) return;
    
    const response = await api.qrCodes.deleteQRCode(id, token);
    await fetchQRCodes(); // Refresh data
    return response;
  }, [token, fetchQRCodes]);

  const downloadQRCode = useCallback(async (id: number) => {
    if (!token) return;
    
    return await api.qrCodes.downloadQRCode(id, token);
  }, [token]);

  return {
    qrCodes,
    loading,
    fetchQRCodes,
    createQRCode,
    updateQRCode,
    deleteQRCode,
    downloadQRCode
  };
};
