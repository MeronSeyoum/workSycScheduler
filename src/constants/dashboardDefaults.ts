// src/constants/dashboardDefaults.ts
import { DashboardResponse } from "@/types/dashboard";

export const DEFAULT_DASHBOARD_RESPONSE: DashboardResponse = {
  clients: [],
  employees: [],
  shifts: [],
  stats: {
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    teamLeads: 0,
    attendanceTrend: [],
    statusDistribution: [],
    positionDistribution: [],
    recentActivities: [],
    totalClients: 0,
    activeClients: 0,
    upcomingShifts: 0,
    totalShifts:0,
    completedShifts: 0,
    prevPeriodStats: {
      totalEmployees: 0,
      activeClients: 0,
      completedShifts: 0
    }
  }
};