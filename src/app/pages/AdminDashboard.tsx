// components/admin/dashboard/AdminDashboard.tsx
"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Skeleton } from "antd";
import {

  AlertCircle,
  TrendingUp,
  Activity,

} from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import DateRangeSelector from "@/components/ui/dashboard/DateRangeSelector";
import { api } from "@/lib/api";
import { DashboardResponse } from "@/lib/types/dashboard";
import { DEFAULT_DASHBOARD_RESPONSE } from "@/lib/constants/dashboardDefaults";


import { TabType } from "@/lib/types/dashboard";
import { OverviewTab } from "@/components/ui/dashboard/OverviewTab";
import { PerformanceTab } from "@/components/ui/dashboard/PerformanceTab";
import { AlertsTab } from "@/components/ui/dashboard/AlertsTab";


export const COLORS = {
  completed: "#00C49F",
  scheduled: "#8884D8",
  missed: "oklch(70.4% 0.191 22.216)",
  active: "#00C49F",
  on_hold: "#FFBB28",
  inactive: "#FF8042",
};
const AdminDashboard = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // Memoized data
  const { clients, employees, shifts, stats } = useMemo(() => {
    if (!dashboardData) {
      return {
        clients: [],
        employees: [],
        shifts: [],
        stats: DEFAULT_DASHBOARD_RESPONSE.stats,
      };
    }
    return dashboardData;
  }, [dashboardData]);

  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.dashboardService.fetchDashboardData(
        token,
        dateRange
      );
      setDashboardData(data);
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
      toast.error(
        `Error loading data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const presetRanges = [
    {
      label: "Last 7 Days",
      value: {
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date(),
      },
    },
    {
      label: "Last 30 Days",
      value: {
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
      },
    },
    {
      label: "This Month",
      value: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
  ];

  if (isLoading) {
    return (
        <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-6 bg-gray-50">
          <Skeleton />
        </div>
     
    );
  }

  return (
      <div className="min-h-screen max-w-7xl mx-auto space-y-6">
        {/* Header with Date Range Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-base font-semibold text-slate-800">
              {dateRange.from.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              -{" "}
              {dateRange.to.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="flex gap-2">
              {presetRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => setDateRange(range.value)}
                  className={`text-xs px-3 py-1 rounded-full ${
                    dateRange.from.getTime() === range.value.from.getTime() &&
                    dateRange.to.getTime() === range.value.to.getTime()
                      ? "bg-teal-100 text-slate-800"
                      : "bg-[#e5f0F0] text-slate-600 hover:bg-teal-700 hover:text-white"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-gray-300">
          {(["overview", "performance", "alerts"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm flex items-center ${
                activeTab === tab
                  ? "border-b-2 border-teal-600 text-teal-700"
                  : "text-gray-500"
              }`}
            >
              {tab === "overview" && <Activity className="h-4 w-4 mr-2" />}
              {tab === "performance" && <TrendingUp className="h-4 w-4 mr-2" />}
              {tab === "alerts" && <AlertCircle className="h-4 w-4 mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && <OverviewTab {...{ stats, shifts, clients, employees, dateRange }} />}

        {/* Performance Tab */}
        {activeTab === "performance" && <PerformanceTab {...{ employees, shifts, clients }} />}

        {/* Alerts Tab */}
        {activeTab === "alerts" && <AlertsTab {...{ shifts, employees, clients }} />}
      </div>
  );
};

export default AdminDashboard;