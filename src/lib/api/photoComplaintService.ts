// ============================================
// photoComplaintService.ts - FIXED VERSION
// ============================================
import { ComplaintFilters, PhotoComplaint, ComplaintStatusUpdate, CreateComplaintData } from '../types/PhotoComplaint';
import { fetchWithAuth } from './apiBase';

export const fetchPhotoComplaints = async (token: string, filters?: ComplaintFilters): Promise<PhotoComplaint[]> => {
  const queryParams = new URLSearchParams();
  
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.clientId) queryParams.append('client_id', filters.clientId);
  if (filters?.photoId) queryParams.append('photo_id', filters.photoId);

  const url = `/photo-complaints${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetchWithAuth<PhotoComplaint[]>(url, {
    method: 'GET',
  }, token);
  return response.data || [];
};

export const getPhotoComplaintById = async (token: string, id: string): Promise<PhotoComplaint> => {
  const response = await fetchWithAuth<PhotoComplaint>(`/photo-complaints/${id}`, {
    method: 'GET',
  }, token);
  return response.data!;
};

// ✅ FIXED: Now uses correct type with snake_case
export const createPhotoComplaint = async (
  token: string,
  complaintData: CreateComplaintData
): Promise<PhotoComplaint> => {
  const response = await fetchWithAuth<PhotoComplaint>('/photo-complaints', {
    method: 'POST',
    body: JSON.stringify(complaintData),
  }, token);
  return response.data!;
};

// ✅ FIXED: Now uses correct type with snake_case
export const updateComplaintStatus = async (
  token: string,
  id: string, 
  statusData: ComplaintStatusUpdate
): Promise<PhotoComplaint> => {
  const response = await fetchWithAuth<PhotoComplaint>(`/photo-complaints/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  }, token);
  return response.data!;
};

export const deletePhotoComplaint = async (token: string, id: string): Promise<void> => {
  await fetchWithAuth(`/photo-complaints/${id}`, {
    method: 'DELETE',
  }, token);
};

// Get complaints by photo
export const getComplaintsByPhotoId = async (token: string, photoId: string): Promise<PhotoComplaint[]> => {
  const response = await fetchWithAuth<PhotoComplaint[]>(`/photo-complaints/photo/${photoId}`, {
    method: 'GET',
  }, token);
  return response.data || [];
};

// Get active complaints (filed + under_review)
export const getActiveComplaints = async (token: string): Promise<PhotoComplaint[]> => {
  const response = await fetchWithAuth<PhotoComplaint[]>('/photo-complaints?status=filed&status=under_review', {
    method: 'GET',
  }, token);
  return response.data || [];
};

// Get resolved complaints
export const getResolvedComplaints = async (token: string): Promise<PhotoComplaint[]> => {
  const response = await fetchWithAuth<PhotoComplaint[]>('/photo-complaints?status=resolved&status=dismissed', {
    method: 'GET',
  }, token);
  return response.data || [];
};