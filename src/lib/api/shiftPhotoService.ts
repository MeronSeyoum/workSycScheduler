// ============================================
// shiftPhotoService.ts - FIXED VERSION
// ============================================
import { ShiftPhoto, ShiftPhotoFilters, PhotoApprovalUpdate, BulkPhotoApproval } from '../types/shiftPhoto';
import { fetchWithAuth } from './apiBase';

export const fetchShiftPhotos = async (token: string, filters?: ShiftPhotoFilters): Promise<ShiftPhoto[]> => {
  const queryParams = new URLSearchParams();
  
  if (filters?.shiftId) queryParams.append('shift_id', filters.shiftId);
  if (filters?.employeeId) queryParams.append('employee_id', filters.employeeId);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.includeComplaints) queryParams.append('includeComplaints', 'true');

  const url = `/shift-photos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetchWithAuth<ShiftPhoto[]>(url, {
    method: 'GET',
  }, token);
  return response.data || [];
};

// ✅ FIXED: Now uses correct type
export const updatePhotoApproval = async (
  token: string,
  id: string, 
  approvalData: PhotoApprovalUpdate
): Promise<ShiftPhoto> => {
  const response = await fetchWithAuth<ShiftPhoto>(`/shift-photos/${id}/approval`, {
    method: 'PATCH',
    body: JSON.stringify(approvalData),
  }, token);
  return response.data!;
};

// ✅ FIXED: Now uses correct type and returns proper response
export const bulkUpdatePhotoApproval = async (
  token: string,
  bulkData: BulkPhotoApproval
): Promise<{ message: string; updatedPhotos: ShiftPhoto[] }> => {
  const response = await fetchWithAuth<{ message: string; updatedPhotos: ShiftPhoto[] }>(
    '/shift-photos/bulk-approval', 
    {
      method: 'POST',
      body: JSON.stringify(bulkData),
    }, 
    token
  );
  return response.data!;
};

export const getShiftPhotoById = async (token: string, id: string): Promise<ShiftPhoto> => {
  const response = await fetchWithAuth<ShiftPhoto>(`/shift-photos/${id}`, {
    method: 'GET',
  }, token);
  return response.data!;
};

export const deleteShiftPhoto = async (token: string, id: string): Promise<void> => {
  await fetchWithAuth(`/shift-photos/${id}`, {
    method: 'DELETE',
  }, token);
};

// Get pending photos for approval
export const getPendingShiftPhotos = async (token: string): Promise<ShiftPhoto[]> => {
  const response = await fetchWithAuth<ShiftPhoto[]>('/shift-photos?status=pending', {
    method: 'GET',
  }, token);
  return response.data || [];
};

