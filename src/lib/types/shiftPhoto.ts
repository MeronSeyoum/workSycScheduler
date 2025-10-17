
// ============================================
// shiftPhoto.ts - FIXED VERSION
// ============================================
import { Employee } from "./employee";
import { PhotoComplaint } from "./PhotoComplaint";
import { Shift } from "./shift";
import { Task } from "./task";

export interface ShiftPhoto {
  id: string;
  shift_id: number;
  employee_id: number;
  task_id?: number;  // ✅ Fixed: should be number, not string
  photo_url: string;
  public_id: string;
  description?: string;
  uploaded_at: string;
  manager_approval_status: 'pending' | 'approved' | 'rejected';
  manager_approved_at?: string;
  manager_comment?: string;
  custom_task_name?: string;
  geo_location?: string;
  metadata?: string;  // ✅ Fixed: made optional
  created_at: string;
  updated_at: string;
  
  // Associations
  employee: Employee;
  shift: Shift;
  task?: Task;
  complaints?: PhotoComplaint[];
}

// Helper to get task name (either from task or custom)
export const getTaskName = (photo: ShiftPhoto): string => {
  return photo.task?.name || photo.custom_task_name || 'Unnamed Task';
};

export interface ShiftPhotoFilters {
  shiftId?: string;
  employeeId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  includeComplaints?: boolean;
}

// ✅ FIXED: Match API expectations
export interface PhotoApprovalUpdate {
  manager_approval_status: 'pending' | 'approved' | 'rejected';
  manager_comment?: string;
}

// ✅ FIXED: Match API expectations
export interface BulkPhotoApproval {
  photo_ids: string[];
  manager_approval_status: 'approved' | 'rejected';
  manager_comment?: string;
}

