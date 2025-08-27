// types/shift.ts

export type ShiftType = 'regular' | 'emergency';
export type ShiftStatus = 'scheduled' | 'completed' | 'missed';

interface Timestamps {
  created_at?: string;
  updated_at?: string;
}

// Shift Interface
export interface Shift extends Timestamps {
  id: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
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
  client_id: number;
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

export interface ShiftWithEmployees extends Shift {
  client: {
    id: number;
    business_name: string;
  };
  employee_shifts: Array<{
    employee_id: number;
    status: ShiftStatus;
    // other fields...
  }>;
  employees: {
    id: number;
    employee_id: number;
    shift_id: number;
    assigned_by: number;
    status: ShiftStatus;
    notes: string | null;
    created_at: string;
    updated_at: string;
    employee: {
      id: number;
      user_id: number;
      employee_code: string;
      phone_number: string;
      position: string;
      profile_image_url: string | null;
      status: string;
      hire_date: string;
      termination_date: string | null;
      assigned_locations: string[];
      contact: {
        phone: string;
        emergencyContact: string;
        address: string;
      };
      user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
      };
    };
  }[];
}
