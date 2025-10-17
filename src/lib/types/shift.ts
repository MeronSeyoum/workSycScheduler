// types/shift.ts

import { Client } from "./client";

export type ShiftType = 'regular' | 'emergency';
export type ShiftStatus ='scheduled' | 'completed' | 'missed'| 'in_progress'| 'cancelled'| 'draft' ;

interface Timestamps {
  created_at?: string;
  updated_at?: string;
}

// Base Shift Interface
export interface Shift extends Timestamps {
  id: number;
  name?: string;
  date: string;
  start_time: string;
  end_time: string;
  break_duration?: number; // in minutes
  client_id: number;
  created_by: number;
  shift_type: ShiftType;
  notes?: string;
  status?: string;
  client: Client;
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
  status?:string;
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
  client: Client;
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


export interface CreateShiftResult {
  status: string;
  shift: ShiftWithEmployees;
  warnings?: string[];
  employees?: any[]; // Add this if the API returns employees array
}
