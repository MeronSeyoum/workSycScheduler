import { Dayjs } from "dayjs";
import { Client } from "./client";
import { Employee } from "./employee";
import { ShiftWithEmployees } from "./shift";

// types/schedule.ts
export interface LocationData {
  id: string;
  name: string;
}

export interface LoadingState {
  shifts: boolean;
  employees: boolean;
  clients: boolean;
  general: boolean;
  aiScheduling: boolean;
  publishing: boolean;
}

export interface OpenShift {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  location: string;
  required_skills: string[];
}

export interface ShiftSwapRequest {
  id: number;
  shift_id: number;
  requester_id: number;
  requested_employee_id: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
  created_at: string;
}

export interface StatsData {
  totalShifts: number;
  nightShifts: number;
  avgHours: number;
  balanceScore: number;
  draftShifts: number;
  unassignedShifts: number;
}

export interface Conflict {
  id: string;
  type: string;
  description: string;
}

export interface ComponentState {
  shifts: ShiftWithEmployees[];
  employees: Employee[];
  clients: Client[];
  selectedLocation: LocationData | null;
  dateRange: [Dayjs, Dayjs];
  view: "day" | "week" | "month";
  searchTerm: string;
  departmentFilter: string;
  isTimePickerModalOpen: boolean;
  shiftToEdit: ShiftWithEmployees | null;
  newTime: { start: string; end: string };
  error: string | null;
  loading: LoadingState;
  openShifts: OpenShift[];
  shiftSwapRequests: ShiftSwapRequest[];
  isAISchedulerModalOpen: boolean;
  isOpenShiftsModalOpen: boolean;
  isShiftSwapsModalOpen: boolean;
  complianceWarnings: string[];
  sidebarCollapsed: boolean;
  selectedNavKey: string;
  showStatsDashboard: boolean;
  selectedShiftTime: { start: string; end: string };
  showShiftTimeSelector: boolean;
  isCreateShiftModalVisible: boolean;
  selectedDateForModal?: string;
  unassignedShifts: ShiftWithEmployees[];
  draftShifts: ShiftWithEmployees[];
  isCreateUnassignedModal: boolean;
  selectedEmployeeForModal?: number;
  selectedEmployeeData?: Employee;
   dragState: {
    isDragging: boolean;
    draggedShift: ShiftWithEmployees | null;
    dropPreview: string | null;
  };
  optimisticUpdates: {
    pendingMoves: Map<number, { employeeId: number; date: string }>;
    pendingSwaps: Map<string, { shift1: ShiftWithEmployees; shift2: ShiftWithEmployees }>;
    pendingDeletes: Set<number>;
  };
  // Copy/Paste & Template state
  copiedWeekSchedule: WeekScheduleData | null;
  scheduleTemplates: ScheduleTemplate[];
  isCopyWeekModalVisible: boolean;
  isTemplateModalVisible: boolean;
  templateName: string;
  templateDescription: string;
}

export interface WeekScheduleData {
  weekStart: string; // ISO date string (Monday of the week)
  weekEnd: string; // ISO date string (Sunday of the week)
  shifts: ShiftWithEmployees[];
  metadata: {
    totalShifts: number;
    totalHours: number;
    employeeCount: number;
    locationId: string;
    locationName: string;
    createdAt: string;
  };
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string;
  weekSchedule: WeekScheduleData;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  isDefault?: boolean;
  tags?: string[];
}