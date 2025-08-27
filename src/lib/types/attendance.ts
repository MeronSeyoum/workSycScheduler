// src/types/attendance.ts

// Consolidated AttendanceSummary interface
export interface AttendanceSummary {
  present: number;
  late: number;
  absent: number;
  early: number;
  earlyDepartures?: number;
  clockedInToday?: number;
  onLeaveToday?: number;
  avgWeeklyHours?: number;
  weeklyPresent?: number;
  weeklyLate?: number;
  monthlyWorkedDays?: number;
  monthlyAbsentDays?: number;
  monthlyLeaveDays?: number;
  timestamp?: number;
}

// Unified AttendanceRecord interface
export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  date: string;
  clockIn: string;
  clockOut: string ;
  status: 'pending'|
    'present'|
    'late_arrival'|
    'early_departure'|
    'late_and_early'|
    'absent'|
    'on_leave'|
    'partial_attendance'|
    'no_show'|
    'excused_absence';
  hoursWorked: number;
  shiftType: string;
  position: string,
  location?: string;
  method: 'geofence' | 'qrcode' | 'manual';
  notes?: string;
}

// API Response version of AttendanceRecord
export interface ApiAttendanceRecord {
  id: number;
  employee_id: number;
  clock_in_time: string;
  clock_out_time: string ;
  hours: number;
  status: 'pending'|
    'present'|
    'late_arrival'|
    'early_departure'|
    'late_and_early'|
    'absent'|
    'on_leave'|
    'partial_attendance'|
    'no_show'|
    'excused_absence';
  method: 'geofence' | 'qrcode' | 'manual';
  notes?: string;
  location?: string;
  position: string,
  employee?: {
    employee_code: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  shift?: {
    date: string;
    shift_type: string;
    client: {
      business_name: string;
    };
  };
}

export interface AttendanceFilterParams {
  startDate: string;
  endDate: string;
  status?: 'pending'|
    'present'|
    'late_arrival'|
    'early_departure'|
    'late_and_early'|
    'absent'|
    'on_leave'|
    'partial_attendance'|
    'no_show'|
    'excused_absence';
  locationId?: number;
  departmentId?: number;
}

export interface ClockInOutRequest {
  employeeId: number;
  method: 'geofence' | 'qrcode' | 'manual';
  timestamp?: string;
  location?: string;
  qrCode?: string;
  notes?: string;
}

export interface ManualEntryRequest extends Omit<ClockInOutRequest, 'method'> {
  date: string;
  clockIn: string;
  clockOut?: string;
  status: 'pending'|
    'present'|
    'late_arrival'|
    'early_departure'|
    'late_and_early'|
    'absent'|
    'on_leave'|
    'partial_attendance'|
    'no_show'|
    'excused_absence';
  approvedById?: number;
}

export interface AttendanceData {
  summary?: AttendanceSummary;
  recent?: AttendanceRecord[];
  recentAttendanceSheet?: AttendanceRecord[];
}

export interface AttendanceChartData {
  dailyData: {
    date: string;
    present: number;
    late: number;
    absent: number;
    onTime: number;
  }[];
  summary: AttendanceSummary;
}