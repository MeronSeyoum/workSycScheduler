import { Client } from "./client";
import { ShiftPhoto } from "./shiftPhoto";
import { User } from "./user";





export interface Task {
  id: string;
  name: string;
  description?: string;
  category: string;
  estimated_time_minutes?: number;
  requires_photo: boolean;
  sample_photo_url?: string;
  instructions?: string;
  client_specific: boolean;
  client_id?: number;
  status: 'active' | 'inactive' | 'archived';
  created_by: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  created_at: string;
  updated_at: string;
  
  // Associations
  client?: Client;
  creator?: User;
  shift_photos?: ShiftPhoto[];
}

export interface CreateTaskData {
  name: string;
  description?: string;
  category: string;
  estimated_time_minutes?: number;
  requires_photo: boolean;
  sample_photo_url?: string;
  instructions?: string;
  client_specific: boolean;
  client_id?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

export interface UpdateTaskData {
  name?: string;
  description?: string;
  category?: string;
  estimated_time_minutes?: number;
  requires_photo?: boolean;
  sample_photo_url?: string;
  instructions?: string;
  client_specific?: boolean;
  client_id?: number;
  status?: 'active' | 'inactive' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

export interface TaskFilters {
  category?: string;
  client_id?: number;
  status?: 'active' | 'inactive' | 'archived';
  requires_photo?: boolean;
  client_specific?: boolean;
}