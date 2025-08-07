// src/services/attendanceService.ts
import { fetchWithAuth } from "./apiBase";
import {
  AttendanceSummary,
  AttendanceRecord,
  AttendanceFilterParams,
  ClockInOutRequest,
  ManualEntryRequest,
  AttendanceChartData,
} from "@/types/attendance";

// Summary and Reports

export const fetchAttendanceSummary = async (
  params: { startDate: string; endDate: string },
  token: string
): Promise<AttendanceSummary> => {
  const query = new URLSearchParams();
  query.append("startDate", params.startDate);
  query.append("endDate", params.endDate);

  try {
    const response = await fetchWithAuth<AttendanceSummary>(
      `/attendance/summary?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      },
      token // Make sure token is passed here
    );


    if (!response?.data) {
      console.error("Invalid response structure:", response);
      throw new Error("Invalid server response");
    }

    const summaryData = response.data;

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
});

export const fetchRecentAttendance = async (
  params: { startDate: string; endDate: string; limit?: number },
  token: string
): Promise<AttendanceRecord[]> => {
  const query = new URLSearchParams();
  query.append("startDate", params.startDate);
  query.append("endDate", params.endDate);
  if (params.limit) query.append("limit", params.limit.toString());

  const response = await fetchWithAuth<AttendanceRecord[]>(
    `/attendance/recent?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data || [];
};

export const fetchAttendanceReport = async (
  params: AttendanceFilterParams,
  token: string
): Promise<AttendanceRecord[]> => {
  const query = new URLSearchParams();

  // Add all parameters that exist
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.employeeId)
    query.append("employeeId", params.employeeId.toString());
  if (params.teamId) query.append("teamId", params.teamId.toString());
  if (params.status) query.append("status", params.status);
  if (params.limit) query.append("limit", params.limit.toString());

  const response = await fetchWithAuth<AttendanceRecord[]>(
    `/attendance/report?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data || [];
};

// Clock In/Out Operations - These remain unchanged as they use POST with body
export const clockIn = async (
  data: ClockInOutRequest,
  token: string
): Promise<AttendanceRecord> => {
  const response = await fetchWithAuth<AttendanceRecord>(
    "/attendance/clock-in",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  return response.data!;
};

export const clockOut = async (
  data: ClockInOutRequest,
  token: string
): Promise<AttendanceRecord> => {
  const response = await fetchWithAuth<AttendanceRecord>(
    "/attendance/clock-out",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  return response.data!;
};

// Manual Entries - These remain unchanged as they use POST/PUT with body
export const createManualEntry = async (
  data: ManualEntryRequest,
  token: string
): Promise<AttendanceRecord> => {
  const response = await fetchWithAuth<AttendanceRecord>("/attendance/manual", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.data!;
};

export const updateAttendanceRecord = async (
  id: number,
  data: Partial<ManualEntryRequest>,
  token: string
): Promise<AttendanceRecord> => {
  const response = await fetchWithAuth<AttendanceRecord>(`/attendance/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.data!;
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
  });
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
  if (params.limit) query.append("limit", params.limit.toString());

  const response = await fetchWithAuth<AttendanceRecord[]>(
    `/attendance/employee/${employeeId}?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data || [];
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
  if (params.limit) query.append("limit", params.limit.toString());

  const response = await fetchWithAuth<AttendanceRecord[]>(
    `/attendance/team/${teamId}?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data || [];
};

export const  fetchAttendanceChartData = async(
    params: { startDate: string; endDate: string },
    token: string
  ): Promise<AttendanceChartData> => {
    const query = new URLSearchParams();
    query.append('startDate', params.startDate);
    query.append('endDate', params.endDate);

    const response = await fetchWithAuth<AttendanceChartData>(
      `/attendance/chart?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response) {
      throw new Error('Failed to fetch attendance chart data');
    }
console.log("Chart data ", response.data)
    return response.data?.dailyData;
  };





