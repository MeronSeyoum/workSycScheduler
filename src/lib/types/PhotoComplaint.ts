// ============================================
// PhotoComplaint.ts - FIXED VERSION
// ============================================
import { ShiftPhoto } from './shiftPhoto';
import { Client } from './client';

export interface PhotoComplaint {
  id: string;
  photo_id: string;  // snake_case
  client_id: number;  // snake_case and number type
  reason: 'poor_quality' | 'task_incomplete' | 'wrong_location' | 'safety_concern' | 'other';
  description: string;
  status: 'filed' | 'under_review' | 'resolved' | 'dismissed';
  resolved_at?: string;  // snake_case
  resolution_note?: string;  // snake_case
  created_at: string;  // snake_case
  updated_at: string;  // snake_case
  
  // Associations
  ShiftPhoto: ShiftPhoto;
  client: Client;
}

export interface ComplaintFilters {
  status?: 'filed' | 'under_review' | 'resolved' | 'dismissed';
  clientId?: string;  // Query param can be string
  photoId?: string;   // Query param can be string
}

export interface ComplaintStatusUpdate {
  status: 'filed' | 'under_review' | 'resolved' | 'dismissed';
  resolution_note?: string;  // snake_case to match API
}

export interface CreateComplaintData {
  photo_id: string;   // snake_case
  client_id: number;  // snake_case
  reason: 'poor_quality' | 'task_incomplete' | 'wrong_location' | 'safety_concern' | 'other';
  description: string;
}
