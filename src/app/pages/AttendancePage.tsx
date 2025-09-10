import React, { useState, useEffect, useCallback } from "react";
import { format, subDays } from "date-fns";
import {
  Clock,
  CalendarCheck,
  CalendarX,
  BarChart2,
  Table,
} from "lucide-react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/common/skeleton";
import AttendanceStats from "@/components/ui/attendance/AttendanceStats";
import RecentAttendanceTable from "@/components/ui/attendance/RecentAttendanceTable";
import { notification } from "antd";
import { useAuth } from "@/components/providers/AuthProvider";
import AttendanceTrendChart from "@/components/ui/attendance/AttendanceTrendChart";
import HoursWorkedChart from "@/components/ui/attendance/HoursWorkedChart";
import { Progress } from "@/components/ui/attendance/progress";
import { Employee } from "@/lib/types/employee";
import { ManualEntryModal } from "@/components/modal/ManualEntryModal";
import AttendanceSheet from "@/components/ui/attendance/attendanceSheet";
import { AttendanceRecord, AttendanceSummary } from "@/lib/types/attendance";
import { DateRange } from "@/lib/types/dashboard";
import DateRangeAttendance from "@/components/ui/attendance/DateRangeAttendance";

const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = useCallback(
    (
      type: "success" | "error" | "info",
      message: string,
      description?: string
    ) => {
      const icons = {
        success: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        error: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        info: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
      };

      api[type]({
        message,
        description,
        icon: icons[type],
        placement: "topRight",
        duration: type === "error" ? 4 : 3,
      });
    },
    [api]
  );

  return { showNotification, contextHolder };
};

export default function AttendancePage() {
  const { token } = useAuth();
  const { showNotification, contextHolder } = useNotification();

  // Tab state management
  const [activeTab, setActiveTab] = useState<
    "overview" | "charts" | "timesheets"
  >("overview");

  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [loading, setLoading] = useState({
    summary: true,
    recent: true,
    charts: true,
  });
  const [attendanceData, setAttendanceData] = useState<{
    summary?: AttendanceSummary;
    recent?: AttendanceRecord[];
    recentAttendanceSheet?: AttendanceRecord[];
    chart?: any;
  }>({});

  const [employees, setEmployees] = useState<Employee[]>([]);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token) return;

      try {
        const response = await api.employees.fetchEmployees(token);
        const employeeData: Employee[] = Array.isArray(response)
          ? response
          : response || [];
        setEmployees(employeeData);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        showNotification("error", "Failed to load employees");
      }
    };

    fetchEmployees();
  }, [token, showNotification]);

  const fetchAttendanceData = useCallback(async () => {
    if (!token) {
      showNotification("error", "Authentication Required", "Please login");
      return;
    }

    try {
      setLoading({ summary: true, recent: true, charts: true });

      console.log("Fetching data for date range:", {
        start: format(dateRange.from, "yyyy-MM-dd"),
        end: format(dateRange.to, "yyyy-MM-dd"),
      });

      const [
        summaryResponse,
        recentResponse,
        recentAttendanceSheetResponse,
        chartResponse,
      ] = await Promise.allSettled([
        api.attendanceService.fetchAttendanceSummary(
          {
            startDate: format(dateRange.from, "yyyy-MM-dd"),
            endDate: format(dateRange.to, "yyyy-MM-dd"),
          },
          token
        ),
        api.attendanceService.fetchRecentAttendance(
          {
            startDate: format(dateRange.from, "yyyy-MM-dd"),
            endDate: format(dateRange.to, "yyyy-MM-dd"),
            limit: 5,
          },
          token
        ),

        api.attendanceService.fetchRecentAttendance(
          {
            startDate: format(dateRange.from, "yyyy-MM-dd"),
            endDate: format(dateRange.to, "yyyy-MM-dd"),
            limit: 100,
          },
          token
        ),
        api.attendanceService.fetchAttendanceChartData(
          {
            startDate: format(dateRange.from, "yyyy-MM-dd"),
            endDate: format(dateRange.to, "yyyy-MM-dd"),
          },
          token
        ),
      ]);

      // Handle each response safely
      const summary =
        summaryResponse.status === "fulfilled"
          ? summaryResponse.value
          : getDefaultAttendanceSummary();
      const recent =
        recentResponse.status === "fulfilled" ? recentResponse.value : [];
      const recentAttendanceSheet =
        recentAttendanceSheetResponse.status === "fulfilled"
          ? recentAttendanceSheetResponse.value
          : [];
      const chart =
        chartResponse.status === "fulfilled"
          ? chartResponse.value
          : getDefaultChartData();

      // Log any rejected promises
      if (summaryResponse.status === "rejected") {
        console.error("Summary fetch failed:", summaryResponse.reason);
      }
      if (recentResponse.status === "rejected") {
        console.error("Recent attendance fetch failed:", recentResponse.reason);
      }
      if (chartResponse.status === "rejected") {
        console.error("Chart data fetch failed:", chartResponse.reason);
      }

      // Data is already transformed by the service layer
      const newAttendanceData = {
        summary,
        recent,
        recentAttendanceSheet,
        chart,
      };

      setAttendanceData(newAttendanceData);

      // Show partial success notification if some requests failed
      const failedRequests = [
        summaryResponse,
        recentResponse,
        chartResponse,
      ].filter((r) => r.status === "rejected").length;
      if (failedRequests > 0 && failedRequests < 3) {
        showNotification(
          "info",
          "Partial Data Loaded",
          `${failedRequests} out of 3 data requests failed. Some information may be incomplete.`
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showNotification(
        "error",
        "Loading Failed",
        error instanceof Error ? error.message : "Unknown error"
      );
      setAttendanceData({
        summary: getDefaultAttendanceSummary(),
        recent: [],
        chart: getDefaultChartData(),
      });
    } finally {
      setLoading({ summary: false, recent: false, charts: false });
    }
  }, [dateRange, token, showNotification]);

  // Add debugging effect to track state changes
  useEffect(() => {
    console.log("Attendance data updated:", attendanceData);
  }, [attendanceData]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Calculate attendance statistics with safe division
  const attendanceStats = attendanceData?.summary
    ? {
        totalDays:
          attendanceData.summary.present +
            attendanceData.summary.absent +
            attendanceData.summary.late || 1,
        presentPercentage:
          (attendanceData.summary.present /
            (attendanceData.summary.present +
              attendanceData.summary.absent +
              attendanceData.summary.late || 1)) *
          100,
        latePercentage:
          (attendanceData.summary.late /
            (attendanceData.summary.present +
              attendanceData.summary.absent +
              attendanceData.summary.late || 1)) *
          100,
        onTimePercentage:
          ((attendanceData.summary.present - attendanceData.summary.late) /
            (attendanceData.summary.present +
              attendanceData.summary.absent +
              attendanceData.summary.late || 1)) *
          100,
      }
    : null;

  return (
    <>
      {contextHolder}
      <div className="space-y-3 ">
        {/* Right-aligned controls */}
        <div className="flex lg:flex-row flex-col gap-3 w-full sm:w-auto items-start xs:items-center justify-end">
          <DateRangeAttendance
            value={dateRange}
            onChange={setDateRange}
            className="w-full xs:w-auto"
          />
        </div>
        {/* Header with tabs and controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Tab buttons */}
          <div className="flex border-b border-gray-200 w-full sm:w-auto">
            <button
              className={`px-4 py-2 text-sm font-semibold flex items-center ${
                activeTab === "overview"
                  ? "border-b-2 border-teal-600 text-teal-700"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold flex items-center ${
                activeTab === "charts"
                  ? "border-b-2 border-teal-600 text-teal-700"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("charts")}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Charts
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold flex items-center ${
                activeTab === "timesheets"
                  ? "border-b-2 border-teal-600 text-teal-700"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("timesheets")}
            >
              <Table className="h-4 w-4 mr-2" />
              Timesheets
            </button>
          </div>

          <div className="flex lg:flex-row flex-col gap-3 w-full sm:w-auto items-start xs:items-center justify-end">
            <ManualEntryModal
              employees={employees}
              onSuccess={fetchAttendanceData}
              locations={[]}
            />
          </div>
        </div>

        {/* Tab content */}
        <div className="mt-4">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Overview content */}
              {loading.summary ? (
                <Skeleton />
              ) : (
                <AttendanceStats
                  present={attendanceData.summary?.present ?? 0}
                  late={attendanceData.summary?.late ?? 0}
                  absent={attendanceData.summary?.absent ?? 0}
                  earlyDepartures={attendanceData.summary?.early ?? 0}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-800">
                      Today&apo;s Status
                    </h3>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  {loading.summary ? (
                    <Skeleton className="h-24" />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Clocked In:
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {attendanceData.summary?.clockedInToday || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">On Leave:</span>
                        <span className="text-base font-medium text-gray-900">
                          {attendanceData.summary?.onLeaveToday || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Absent:</span>
                        <span className="text-base font-medium text-gray-900">
                          {attendanceData.summary?.absent || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-800">
                      Weekly Overview
                    </h3>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CalendarCheck className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  {loading.summary ? (
                    <Skeleton className="h-24" />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Average Hours:
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {attendanceData.summary?.avgWeeklyHours?.toFixed(1) ||
                            0}
                          h
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Total Present:
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {attendanceData.summary?.weeklyPresent || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Total Late:
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {attendanceData.summary?.weeklyLate || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-800">
                      Monthly Overview
                    </h3>
                    <div className="p-2 bg-red-50 rounded-lg">
                      <CalendarX className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  {loading.summary ? (
                    <Skeleton className="h-24" />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Worked Days:
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {attendanceData.summary?.monthlyWorkedDays || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Absent Days:
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {attendanceData.summary?.monthlyAbsentDays || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Leave Days:
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {attendanceData.summary?.monthlyLeaveDays || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Recent Attendance
                  </h2>
                </div>
                {loading.recent ? (
                  <Skeleton className="h-32" />
                ) : (
                  <RecentAttendanceTable
                    data={(attendanceData.recent || []).map((record) => ({
                      ...record,
                      location: record.location || "Not specified",
                    }))}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "charts" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Attendance Rate
                  </h3>
                  {attendanceStats ? (
                    <>
                      <Progress
                        value={attendanceStats.presentPercentage}
                        className="h-3 mt-2"
                        indicatorClassName="bg-green-500"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span className="font-medium text-gray-900">
                          {attendanceStats.presentPercentage.toFixed(1)}%
                        </span>
                        <span>Present</span>
                      </div>
                    </>
                  ) : (
                    <Skeleton className="h-3 mt-4" />
                  )}
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    On Time Rate
                  </h3>
                  {attendanceStats ? (
                    <>
                      <Progress
                        value={attendanceStats.onTimePercentage}
                        className="h-3 mt-2"
                        indicatorClassName="bg-blue-500"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span className="font-medium text-gray-900">
                          {attendanceStats.onTimePercentage.toFixed(1)}%
                        </span>
                        <span>On Time</span>
                      </div>
                    </>
                  ) : (
                    <Skeleton className="h-3 mt-4" />
                  )}
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Late Rate
                  </h3>
                  {attendanceStats ? (
                    <>
                      <Progress
                        value={attendanceStats.latePercentage}
                        className="h-3 mt-2"
                        indicatorClassName="bg-yellow-500"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span className="font-medium text-gray-900">
                          {attendanceStats.latePercentage.toFixed(1)}%
                        </span>
                        <span>Late</span>
                      </div>
                    </>
                  ) : (
                    <Skeleton className="h-3 mt-4" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-4">
                    Attendance Trend
                  </h3>
                  {loading.charts ? (
                    <Skeleton className="h-64" />
                  ) : (
                    <AttendanceTrendChart
                      data={{
                        labels: attendanceData.chart?.labels || [],
                        present: attendanceData.chart?.present || [],
                        late: attendanceData.chart?.late || [],
                        absent: attendanceData.chart?.absent || [],
                      }}
                    />
                  )}
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-4">
                    Hours Worked
                  </h3>
                  {loading.charts ? (
                    <Skeleton className="h-64" />
                  ) : (
                    <HoursWorkedChart
                      data={{
                        labels: attendanceData.chart?.labels || [],
                        hours: attendanceData.chart?.hours || [],
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "timesheets" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading.recent ? (
                  <Skeleton className="h-32" />
                ) : (
                  <AttendanceSheet
                    data={attendanceData.recentAttendanceSheet || []}
                    showAllColumns={true}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Helper functions
function getDefaultAttendanceSummary(): AttendanceSummary {
  return {
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
  };
}

function getDefaultChartData() {
  return {
    labels: [],
    present: [],
    late: [],
    absent: [],
    hours: [],
  };
}
