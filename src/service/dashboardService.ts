// dashboard.service.ts
import { DashboardResponse, DashboardStats, DateRange } from "@/types/dashboard";
import { fetchWithAuth } from "./apiBase";
import { DEFAULT_DASHBOARD_RESPONSE } from "@/constants/dashboardDefaults";

/**
 * Fetches dashboard data from the API and transforms it into a standardized format
 * @param {string} token - Authentication token
 * @param {DateRange} dateRange - Object containing from/to dates for the data range
 * @returns {Promise<DashboardResponse>} - Promise resolving to dashboard data or default response on error
 */
export const fetchDashboardData = async (
  token: string,
  dateRange: DateRange
): Promise<DashboardResponse> => {
  try {
    // Validate date range parameters
    if (!dateRange.from || !dateRange.to) {
      throw new Error("Invalid date range provided");
    }

    // Format dates to YYYY-MM-DD (without time component)
    const params = new URLSearchParams({
      startDate: dateRange.from.toISOString().split("T")[0],
      endDate: dateRange.to.toISOString().split("T")[0],
    });

    // Make authenticated API request
    const response = await fetchWithAuth(
      `/dashboard?${params}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Handle unexpected response structure
    if (!response?.data) {
      console.warn("Unexpected API response structure", response);
      return DEFAULT_DASHBOARD_RESPONSE;
    }

    // Return transformed data structure
    return {
      clients: response.data.clients || [],
      employees: response.data.employees || [],
      shifts: response.data.shifts || [],
      stats: transformStats(response.data.stats),
      error: null // Explicitly set error to null on success
    };

  } catch (error) {
    console.error("Dashboard service error:", error);
    return {
      ...DEFAULT_DASHBOARD_RESPONSE,
      error: error instanceof Error ? error.message : "Failed to fetch dashboard data"
    };
  }
};

/**
 * Transforms raw stats data from API into typed DashboardStats format
 * @param {any} stats - Raw stats data from API
 * @returns {DashboardStats} - Properly typed and formatted stats object
 */
const transformStats = (stats?: any): DashboardStats => {
  // Return default stats if no data provided
  if (!stats) return DEFAULT_DASHBOARD_RESPONSE.stats;

  return {
    // Employee metrics
    totalEmployees: Number(stats.totalEmployees) || 0,
    activeEmployees: Number(stats.activeEmployees) || 0,
    onLeave: Number(stats.onLeave) || 0,
    teamLeads: Number(stats.teamLeads) || 0,

    // Trend data
    attendanceTrend: (stats.attendanceTrend || []).map((item: any) => ({
      month: item.month,
      present: Number(item.present) || 0,
      absent: Number(item.absent) || 0
    })),
    statusDistribution: (stats.statusDistribution || []).map((item: any) => ({
      status: item.status,
      count: Number(item.count) || 0
    })),
    positionDistribution: (stats.positionDistribution || []).map((item: any) => ({
      position: item.position,
      count: Number(item.count) || 0
    })),
    recentActivities: stats.recentActivities || [],

    // Client metrics
    totalClients: Number(stats.totalClients) || 0,
    activeClients: Number(stats.activeClients) || 0,

    // Shift metrics
    upcomingShifts: Number(stats.upcomingShifts) || 0,
    totalShifts: Number(stats.totalShifts) || 0,
    completedShifts: Number(stats.completedShifts) || 0,

    // Comparison data with previous period
    prevPeriodStats: {
      totalEmployees: Number(stats.prevPeriodStats?.totalEmployees) || 0,
      activeClients: Number(stats.prevPeriodStats?.activeClients) || 0,
      completedShifts: Number(stats.prevPeriodStats?.completedShifts) || 0
    }
  };
};