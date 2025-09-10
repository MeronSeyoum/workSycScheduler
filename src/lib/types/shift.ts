// types/shift.ts

export type ShiftType = 'regular' | 'emergency';
export type ShiftStatus = 'scheduled' | 'completed' | 'missed';

interface Timestamps {
  created_at?: string;
  updated_at?: string;
}

// Base Shift Interface
export interface Shift extends Timestamps {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  client_id: number;
  created_by: number;
  shift_type: ShiftType;
  notes?: string;
  status?: string;
}

// Employee Shift Junction
export interface EmployeeShift extends Timestamps {
  id: number;
  employee_id: number;
  shift_id: number;
  assigned_by: number;
  status: ShiftStatus;
  notes?: string;
}

// DTOs for API Operations
export interface CreateShiftWithEmployeesDto {
  client_id: string;
  date: string;
  start_time: string;
  end_time: string;
  shift_type?: ShiftType;
  employee_ids: number[];
  notes?: string;
}

export interface UpdateShiftDto {
  start_time?: string;
  end_time?: string;
  status?: ShiftStatus;
  notes?: string;
}

// Common employee assignment structure
export interface ShiftEmployeeAssignment {
  assignment_id: number;
  status: ShiftStatus;
  notes: string | null;
  assigned_by: {
    id: number;
    first_name: string;
    last_name: string;
  };
  employee: {
    id: number;
    position: string;
    employee_code: string;
    hire_date: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

// Unified Shift with Employees type (use this for both create and read operations)
export interface ShiftWithEmployees extends Shift {
  
  employees: ShiftEmployeeAssignment[];
  client: {
    id: number;
    business_name: string;
    email?: string;
    phone?: string;
    contact_person?: string;
    location_address?: {
      city: string;
      state: string;
      street: string;
      country: string;
      postal_code: string;
    };
    status?: string;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  // Keep employee_shifts for backward compatibility if needed
  employee_shifts?: Array<{
    id: number;
    employee_id: number;
    shift_id: number;
    assigned_by: number;
    status: ShiftStatus;
    notes: string | null;
  }>;

}

// Alias for create operation response (optional - you can use ShiftWithEmployees everywhere)
export type ShiftWithEmployeesCreate = ShiftWithEmployees;


export interface BulkShiftTemplate {
  id: number;
  name: string;
  shifts: CreateShiftWithEmployeesDto[];
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  created_by: number;
  created_at: string;
  approved_by?: number;
  approved_at?: string;
  scheduled_week: string; // YYYY-MM-DD format for the week this applies to
}

export interface BulkShiftCreationDto {
  name: string;
  shifts: CreateShiftWithEmployeesDto[];
  scheduled_week: string;
}