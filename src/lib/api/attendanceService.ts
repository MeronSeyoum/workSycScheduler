// src/services/attendanceService.ts
import { fetchWithAuth } from "./apiBase";
import {
  AttendanceSummary,
  AttendanceRecord,
  AttendanceFilterParams,
  ClockInOutRequest,
  ManualEntryRequest,
} from "@/lib/types/attendance";

// Helper function to safely format date
const safeFormatDate = (dateValue: any): string => {
  if (!dateValue) return new Date().toISOString().split("T")[0];
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date value:", dateValue);
      return new Date().toISOString().split("T")[0];
    }
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.warn("Error parsing date:", dateValue, error);
    return new Date().toISOString().split("T")[0];
  }
};

// Helper function to transform API attendance record to UI format
const transformAttendanceRecord = (record: any): AttendanceRecord => {
  return {
    id: record.id || 0,
    employeeId: record.employee_id || record.employeeId || 0,
    employeeName: record.employee?.user
      ? `${record.employee.user.first_name || ''} ${record.employee.user.last_name || ''}`.trim()
      : "Unknown Employee",
    employeeCode: record.employee?.employee_code || "N/A",
    date: record.shift?.date || safeFormatDate(record.clock_in_time || record.clockIn),
    clockIn: record.clock_in_time || record.clockIn || '',
    clockOut: record.clock_out_time || record.clockOut || '', // Fixed: empty string instead of null
    status: (record.status as 'pending'|
    'present'|
    'late_arrival'|
    'early_departure'|
    'late_and_early'|
    'absent'|
    'on_leave'|
    'partial_attendance'|
    'no_show'|
    'excused_absence') || 'absent',
    hoursWorked: typeof record.hours === 'number' ? record.hours : 0, // Fixed: 0 instead of null
    shiftType: record.shift?.shift_type || "regular",
    position: record.employee?.position || record.position || "N/A",
    location: record.shift?.client?.business_name || "Remote",
    method: (record.method as 'geofence' | 'qrcode' | 'manual') || 'manual',
    notes: record.notes || undefined,
  };
};

// Summary and Reports
export const fetchAttendanceSummary = async (
  params: { startDate: string; endDate: string },
  token: string
): Promise<AttendanceSummary> => {
  const query = new URLSearchParams();
  query.append("startDate", params.startDate);
  query.append("endDate", params.endDate);

  try {
    const response = await fetchWithAuth<any>(
      `/attendance/summary?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
           "Content-Type": "application/json",
        },
      },
      token
    );

    // Handle both wrapped and direct response formats
    const summaryData = response?.data || response;

    console.log("Raw summaryData response:", summaryData);

    if (!summaryData) {
      console.error("Invalid response structure:", response);
      throw new Error("Invalid server response");
    }

    return {
      present: summaryData.present ?? 0,
      late: summaryData.late ?? 0,
      absent: summaryData.absent ?? 0,
      early: summaryData.early ?? 0,
      earlyDepartures: summaryData.earlyDepartures ?? 0,
      clockedInToday: summaryData.clockedInToday ?? 0,
      onLeaveToday: summaryData.onLeaveToday ?? 0,
      avgWeeklyHours: summaryData.avgWeeklyHours ?? 0,
      weeklyPresent: summaryData.weeklyPresent ?? 0,
      weeklyLate: summaryData.weeklyLate ?? 0,
      monthlyWorkedDays: summaryData.monthlyWorkedDays ?? 0,
      monthlyAbsentDays: summaryData.monthlyAbsentDays ?? 0,
      monthlyLeaveDays: summaryData.monthlyLeaveDays ?? 0,
      timestamp: summaryData.timestamp ?? Date.now(),
    };
  } catch (error) {
    console.error("API Error:", error);
    return getDefaultAttendanceSummary();
  }
};

// Helper function for default values
const getDefaultAttendanceSummary = (): AttendanceSummary => ({
  present: 0,
  late: 0,
  absent: 0,
  early: 0,
  earlyDepartures: 0,
  clockedInToday: 0,
  onLeaveToday: 0,
  avgWeeklyHours: 0,
  weeklyPresent: 0,
  weeklyLate: 0,
  monthlyWorkedDays: 0,
  monthlyAbsentDays: 0,
  monthlyLeaveDays: 0,
  timestamp: Date.now(),
});

export const fetchRecentAttendance = async (
  params: { startDate: string; endDate: string; limit?: number },
  token: string
): Promise<AttendanceRecord[]> => {
  try {
    const query = new URLSearchParams();
    query.append("startDate", params.startDate);
    query.append("endDate", params.endDate);
    if (params.limit) query.append("limit", params.limit.toString());

    const response = await fetchWithAuth<any>(
      `/attendance/recent?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      token
    );

    // Handle both wrapped and direct array response
    const attendanceData = response?.data || response;
    
    if (!Array.isArray(attendanceData)) {
      console.error("Expected array but got:", attendanceData);
      return [];
    }

    // Filter out any records with completely invalid data
    const validRecords = attendanceData.filter(record => {
      if (!record || typeof record !== 'object') {
        console.warn("Invalid record structure:", record);
        return false;
      }
      if (!record.id && !record.employee_id && !record.employeeId) {
        console.warn("Record missing essential fields:", record);
        return false;
      }
      return true;
    });

    return validRecords.map((record, index) => {
      try {
        return transformAttendanceRecord(record);
      } catch (error) {
        console.error(`Error transforming record at index ${index}:`, record, error);
        // Return a complete valid record instead of failing completely
        return {
          id: record.id || index,
          employeeId: record.employee_id || record.employeeId || 0,
          employeeName: "Unknown Employee",
          employeeCode: "N/A",
          date: new Date().toISOString().split("T")[0],
          clockIn: '',
          clockOut: '', // Fixed: empty string instead of null
          status: 'absent' as const,
          hoursWorked: 0, // Fixed: 0 instead of null
          shiftType: "regular",
          position: "N/A",
          location: "Remote",
          method: 'manual' as const,
        };
      }
    });
  } catch (error) {
    console.error("Error fetching recent attendance:", error);
    return [];
  }
};

export const fetchAttendanceChartData = async (
  params: { startDate: string; endDate: string },
  token: string
): Promise<any> => {
  try {
    const query = new URLSearchParams();
    query.append('startDate', params.startDate);
    query.append('endDate', params.endDate);

    const response = await fetchWithAuth<any>(
      `/attendance/chart?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      token
    );

    if (!response) {
      throw new Error('Failed to fetch attendance chart data');
    }

    // Handle different response structures
    let chartData;
    if (response.data?.dailyData) {
      // Backend returns: { success: true, data: { dailyData: [...], summary: {...} } }
      chartData = response.data.dailyData;
    } else if (response.data && Array.isArray(response.data)) {
      // Backend returns: { data: [...] }
      chartData = response.data;
    } else if (Array.isArray(response)) {
      // Backend returns: [...]
      chartData = response;
    } else {
      console.error("Unexpected chart data structure:", response);
      return getDefaultChartData();
    }

    // Transform to the format expected by the frontend
    return {
      labels: chartData.map((item: any) => item.date),
      present: chartData.map((item: any) => item.present || 0),
      late: chartData.map((item: any) => item.late || 0),
      absent: chartData.map((item: any) => item.absent || 0),
      hours: chartData.map((item: any) => item.onTime || item.present || 0), // Use onTime or present as fallback
    };
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return getDefaultChartData();
  }
};

const getDefaultChartData = () => ({
  labels: [],
  present: [],
  late: [],
  absent: [],
  hours: [],
});

export const fetchAttendanceReport = async (
  params: AttendanceFilterParams,
  token: string
): Promise<AttendanceRecord[]> => {
  const query = new URLSearchParams();

  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.status) query.append("status", params.status);

  try {
    const response = await fetchWithAuth<any>(
      `/attendance/report?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      token
    );

    const attendanceData = response?.data || response || [];
    return Array.isArray(attendanceData) ? attendanceData.map(transformAttendanceRecord) : [];
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    return [];
  }
};

// Clock In/Out Operations
export const clockIn = async (
  data: ClockInOutRequest,
  token: string
): Promise<AttendanceRecord> => {
  const response = await fetchWithAuth<any>(
    "/attendance/clock-in",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
    token
  );
  
  const recordData = response?.data || response;
  return transformAttendanceRecord(recordData);
};

export const clockOut = async (
  data: ClockInOutRequest,
  token: string
): Promise<AttendanceRecord> => {
  const response = await fetchWithAuth<any>(
    "/attendance/clock-out",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
    token
  );
  
  const recordData = response?.data || response;
  return transformAttendanceRecord(recordData);
};

// Manual Entries
export const createManualEntry = async (
  data: ManualEntryRequest,
  token: string
): Promise<AttendanceRecord> => {
  const response = await fetchWithAuth<any>("/attendance/manual", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }, token);
  
  const recordData = response?.data || response;
  return transformAttendanceRecord(recordData);
};

export const updateAttendanceRecord = async (
  id: number,
  data: Partial<ManualEntryRequest>,
  token: string
): Promise<AttendanceRecord> => {
  const response = await fetchWithAuth<any>(`/attendance/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }, token);
  
  const recordData = response?.data || response;
  return transformAttendanceRecord(recordData);
};

export const deleteAttendanceRecord = async (
  id: number,
  token: string
): Promise<void> => {
  await fetchWithAuth(`/attendance/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, token);
};

// Employee Specific
export const fetchEmployeeAttendance = async (
  employeeId: number,
  params: AttendanceFilterParams,
  token: string
): Promise<AttendanceRecord[]> => {
  const query = new URLSearchParams();

  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.status) query.append("status", params.status);

  try {
    const response = await fetchWithAuth<any>(
      `/attendance/employee/${employeeId}?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      token
    );
    
    const attendanceData = response?.data || response || [];
    return Array.isArray(attendanceData) ? attendanceData.map(transformAttendanceRecord) : [];
  } catch (error) {
    console.error("Error fetching employee attendance:", error);
    return [];
  }
};

// Team/Group Attendance
export const fetchTeamAttendance = async (
  teamId: number,
  params: AttendanceFilterParams,
  token: string
): Promise<AttendanceRecord[]> => {
  const query = new URLSearchParams();

  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.status) query.append("status", params.status);

  try {
    const response = await fetchWithAuth<any>(
      `/attendance/team/${teamId}?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      token
    );
    
    const attendanceData = response?.data || response || [];
    return Array.isArray(attendanceData) ? attendanceData.map(transformAttendanceRecord) : [];
  } catch (error) {
    console.error("Error fetching team attendance:", error);
    return [];
  }
};