export type TabType = "overview" | "performance" | "alerts";

// User types
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

// Employee types
interface Employee {
  id: number;
  code: string;
  position: string;
  termination_date: Date;
  status: string;
  user: User;
  shifts?: Shift[];
}

// Attendance types
interface Attendance {
  id: number;
  employee_id: number;
  clock_in_time: string;
  clock_out_time: string | null;
  hours: number;
  status: 'present' | 'absent' | 'late';
}

// Employee Shift types
interface EmployeeShift {
  id: number;
  employee: Employee;
  status: string;
  notes: string | null;
}

// Shift types
export interface Shift {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  status: string;
  employeeShifts: EmployeeShift[];
  attendances: Attendance[];
  client: Client;
}

// Client types
export interface Client {
  id: number;
  business_name: string;
  email: string;
  phone: string;
  contact_person: string;
  status: string;
  createdAt: Date;
  shifts: Shift[];
}

// Stats types
export interface AttendanceTrendItem {
  month: string;
  present: number;
  absent: number;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
}

export interface PositionDistributionItem {
  position: string;
  count: number;
}

export interface RecentActivity {
  id: number;
  employee: string;
  action: string;
  timestamp: string;
}
export interface PrevPeriodStats {
  totalEmployees: number;
  activeClients: number;
  completedShifts: number;
}
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  teamLeads: number;
  attendanceTrend: AttendanceTrendItem[];
  statusDistribution: StatusDistributionItem[];
  positionDistribution: PositionDistributionItem[];
  recentActivities: RecentActivity[];
  totalClients: number;
  activeClients: number;
  upcomingShifts: number;
  totalShifts: number;
  completedShifts: number;
  prevPeriodStats: PrevPeriodStats;
}

export interface DashboardResponse {
  clients: Client[];
  employees: Employee[];
  shifts: Shift[];
  stats: DashboardStats;
  error?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}



export const COLORS = {
  completed: "#00C49F",
  scheduled: "#8884D8",
  missed: "oklch(70.4% 0.191 22.216)",
  active: "#00C49F",
  on_hold: "#FFBB28",
  inactive: "#FF8042",
};

export type AlertItem = {
  type: "missed_shift" | "on_leave" | "pending_shift" | "client_on_hold";
  title: string;
  priority: "high" | "medium" | "needs_review" | "needs_followup";
  content: any;
};

export type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  secondaryValue?: number | string;
  secondaryLabel?: string;
  bgColor?: string;
};