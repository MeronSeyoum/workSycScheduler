export interface EmployeeContact {
  phone?: string;
  emergencyContact?: string;
  address?: string;
}

export interface Employee {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  employee_code: string;
  position: string;
  profile_image_url?: string ;
  status: 'active' | 'on_leave' | 'terminated' | 'inactive' | 'suspended';
  assigned_locations?: string[];
  contact?: EmployeeContact;
  hire_date: string; // DateOnly format (YYYY-MM-DD)
  termination_date?: string ; // DateOnly format (YYYY-MM-DD)
  created_at?: string;
  updated_at?: string;
  
  // Associations (optional based on query)
  user?: User;
  shifts?: Shift[];
  attendances?: Attendance[];
}
export interface Location {
  id: number;
  name: string;
  // Add other location properties as needed
}
export interface CreateEmployeeDto {
  user_id: number;
  position: string;
  hire_date: string;
  phone_number?: string;
  employee_code?: string; // Optional (auto-generated if not provided)
  profile_image_url?: string;
  status?: 'active' | 'on_leave' | 'terminated' | 'inactive' | 'suspended';
  assigned_locations?: string[];
  contact?: EmployeeContact;
  termination_date?: string;
}

export interface UpdateEmployeeDto extends Partial<Omit<CreateEmployeeDto, 'user_id'>> {
  id: number;
}

// Supporting interfaces based on your other models
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  created_at?: string;
  updated_at?: string;
}

export interface Shift {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  shift_type: 'regular' | 'emergency';
  created_at?: string;
  updated_at?: string;
}

export interface Attendance {
  id: number;
  clock_in_time: string;
  clock_out_time?: string;
  status: 'present' | 'late' | 'absent';
  method: 'geofence' | 'qrcode' | 'manual';
  created_at?: string;
  updated_at?: string;
}




export interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
}

export interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  teamLeads: number;
  recentActivity: Activity[];
  teamDistribution: { name: string; value: number }[];
  monthlyHires: { month: string; hires: number }[];
  specialtyDistribution: { name: string; value: number }[];
}



