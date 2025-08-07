import { useState, useEffect, useCallback } from "react";
import { format, subDays } from "date-fns";
import { Clock, CalendarCheck, CalendarX, BarChart2, Table } from "lucide-react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { api } from "@/service/api";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { Skeleton } from "@/components/ui/skeleton";
import AttendanceStats from "@/components/ui/attendance/AttendanceStats";
import RecentAttendanceTable from "@/components/ui/attendance/RecentAttendanceTable";
import { notification } from "antd";
import { useAuth } from "@/components/AuthProvider";
import AttendanceTrendChart from "@/components/ui/attendance/AttendanceTrendChart";
import HoursWorkedChart from "@/components/ui/HoursWorkedChart";
import { Progress } from "@/components/ui/attendance/progress";
import { Employee } from "@/types/employee";
import { ManualEntryModal } from "@/components/ui/ManualEntryModal";
import AttendanceSheet from "@/components/ui/attendance/attendanceSheet";

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
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'timesheets'>('overview');

  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7),
    end: new Date(),
  });
  const [loading, setLoading] = useState({
    summary: true,
    recent: true,
    charts: true,
  });
  const [attendanceData, setAttendanceData] = useState<{
    summary?: any;
    recent?: any[];
    chart?: any;
  }>({});

  const [employees, setEmployees] = useState<Employee[]>([]);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token) return;
      
      try {
        // const response = await api.employees.fetchEmployees(token);
        // setEmployees(response || []);
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

      const [summaryResponse, recentResponse, chartResponse] = await Promise.all([
        api.attendanceService.fetchAttendanceSummary(
          {
            startDate: format(dateRange.start, "yyyy-MM-dd"),
            endDate: format(dateRange.end, "yyyy-MM-dd"),
          },
          token
        ),
        api.attendanceService.fetchRecentAttendance(
          {
            startDate: format(dateRange.start, "yyyy-MM-dd"),
            endDate: format(dateRange.end, "yyyy-MM-dd"),
            limit: 5,
          },
          token
        ),
        api.attendanceService.fetchAttendanceChartData(
          {
            startDate: format(dateRange.start, "yyyy-MM-dd"),
            endDate: format(dateRange.end, "yyyy-MM-dd"),
          },
          token
        ),
      ]);

      setAttendanceData({
        summary: summaryResponse,
        recent: recentResponse,
        chart: chartResponse,
      });
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

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Calculate attendance statistics
  const attendanceStats = attendanceData?.summary
    ? {
        presentPercentage: (attendanceData.summary.present / attendanceData.summary.totalDays) * 100,
        latePercentage: (attendanceData.summary.late / attendanceData.summary.totalDays) * 100,
        onTimePercentage: ((attendanceData.summary.present - attendanceData.summary.late) / attendanceData.summary.totalDays) * 100,
      }
    : null;

  return (
    <>
      {contextHolder}
      <div className="space-y-6 py-4">
        {/* Header with tabs and controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Tab buttons */}
          <div className="flex border-b border-gray-200 w-full sm:w-auto">
            <button
              className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'overview' ? 'border-b-2 border-teal-700 text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'charts' ? 'border-b-2 border-teal-700 text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('charts')}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Charts
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'timesheets' ? 'border-b-2 border-teal-700 text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('timesheets')}
            >
              <Table className="h-4 w-4 mr-2" />
              Timesheets
            </button>
          </div>

          {/* Right-aligned controls */}
          <div className="flex flex-co xs:flex-row gap-3 w-full sm:w-auto">
            <DateRangePicker 
              value={dateRange} 
              onChange={setDateRange} 
            />
            <ManualEntryModal 
              employees={employees} 
              onSuccess={fetchAttendanceData}
              locations={[]}
            />
          </div>
        </div>

        {/* Tab content */}
        <div className="mt-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Overview content */}
              {loading.summary ? (
                <Skeleton />
              ) : (
                <AttendanceStats
                  present={attendanceData.summary?.present ?? 0}
                  late={attendanceData.summary?.late ?? 0}
                  absent={attendanceData.summary?.absent ?? 0}
                  earlyDepartures={attendanceData.summary?.earlyDepartures ?? 0}
                  clockedInToday={attendanceData.summary?.clockedInToday ?? 0}
                  onLeaveToday={attendanceData.summary?.onLeaveToday ?? 0}
                  avgWeeklyHours={attendanceData.summary?.avgWeeklyHours ?? 0}
                  weeklyPresent={attendanceData.summary?.weeklyPresent ?? 0}
                  weeklyLate={attendanceData.summary?.weeklyLate ?? 0}
                  monthlyWorkedDays={attendanceData.summary?.monthlyWorkedDays ?? 0}
                  monthlyAbsentDays={attendanceData.summary?.monthlyAbsentDays ?? 0}
                  monthlyLeaveDays={attendanceData.summary?.monthlyLeaveDays ?? 0}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Today's Status</h3>
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  {loading.summary ? (
                    <Skeleton className="h-24" />
                  ) : (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Clocked In:</span>
                        <span className="font-medium">
                          {attendanceData.summary?.clockedInToday || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>On Leave:</span>
                        <span className="font-medium">
                          {attendanceData.summary?.onLeaveToday || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Absent:</span>
                        <span className="font-medium">
                          {attendanceData.summary?.absentToday || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Weekly Overview</h3>
                    <CalendarCheck className="h-5 w-5 text-green-500" />
                  </div>
                  {loading.summary ? (
                    <Skeleton className="h-24" />
                  ) : (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Average Hours:</span>
                        <span className="font-medium">
                          {attendanceData.summary?.avgWeeklyHours?.toFixed(1) || 0}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Present:</span>
                        <span className="font-medium">
                          {attendanceData.summary?.weeklyPresent || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Late:</span>
                        <span className="font-medium">
                          {attendanceData.summary?.weeklyLate || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Monthly Overview</h3>
                    <CalendarX className="h-5 w-5 text-red-500" />
                  </div>
                  {loading.summary ? (
                    <Skeleton className="h-24" />
                  ) : (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Worked Days:</span>
                        <span className="font-medium">
                          {attendanceData.summary?.monthlyWorkedDays || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Absent Days:</span>
                        <span className="font-medium">
                          {attendanceData.summary?.monthlyAbsentDays || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Leave Days:</span>
                        <span className="font-medium">
                          {attendanceData.summary?.monthlyLeaveDays || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="">
                <div className="p-4 border-b border-gray-300">
                  <h2 className="text-lg font-medium">Recent Attendance</h2>
                </div>
                {loading.recent ? (
                  <Skeleton className="h-32" />
                ) : (
                  <RecentAttendanceTable
                    data={attendanceData.recent?.map((record) => ({
                      id: record.id,
                      employeeId: record.employee_id,
                      employeeName: record.employee?.user
                        ? `${record.employee.user.first_name} ${record.employee.user.last_name}`
                        : "Unknown Employee",
                      employeeCode: record.employee?.employee_code || "N/A",
                      date:
                        record.shift?.date ||
                        new Date(record.clock_in_time).toISOString().split("T")[0],
                      clockIn: record.clock_in_time,
                      clockOut: record.clock_out_time,
                      status: record.status.toLowerCase(),
                      hoursWorked: record.hours,
                      shiftType: record.shift?.shift_type || "regular",
                      location: record.shift?.client?.business_name || "Remote",
                      method: record.method.toLowerCase(),
                    }))}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-700">Attendance Rate</h3>
                  {attendanceStats ? (
                    <>
                      <Progress value={attendanceStats.presentPercentage} className="h-2 mt-2" indicatorClassName="bg-green-500" />
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{attendanceStats.presentPercentage.toFixed(1)}%</span>
                        <span>Present</span>
                      </div>
                    </>
                  ) : (
                    <Skeleton className="h-2 mt-4" />
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-700">On Time Rate</h3>
                  {attendanceStats ? (
                    <>
                      <Progress value={attendanceStats.onTimePercentage} className="h-2 mt-2" indicatorClassName="bg-blue-500" />
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{attendanceStats.onTimePercentage.toFixed(1)}%</span>
                        <span>On Time</span>
                      </div>
                    </>
                  ) : (
                    <Skeleton className="h-2 mt-4" />
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-700">Late Rate</h3>
                  {attendanceStats ? (
                    <>
                      <Progress value={attendanceStats.latePercentage} className="h-2 mt-2" indicatorClassName="bg-yellow-500" />
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{attendanceStats.latePercentage.toFixed(1)}%</span>
                        <span>Late</span>
                      </div>
                    </>
                  ) : (
                    <Skeleton className="h-2 mt-4" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  {loading.charts ? (
                    <Skeleton className="h-64" />
                  ) : (
                    <AttendanceTrendChart data={{
                      labels: attendanceData.chart?.labels || [],
                      present: attendanceData.chart?.present || [],
                      late: attendanceData.chart?.late || [],
                      absent: attendanceData.chart?.absent || [],
                    }} />
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  {loading.charts ? (
                    <Skeleton className="h-64" />
                  ) : (
                    <HoursWorkedChart data={{
                      labels: attendanceData.chart?.labels || [],
                      hours: attendanceData.chart?.hours || [],
                    }} />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timesheets' && (
            <div className="space-y-6">
              
              {loading.recent ? (
                <Skeleton className="h-32" />
              ) : (
                <AttendanceSheet
                  data={attendanceData.recent?.map((record) => ({
                    id: record.id,
                    employeeId: record.employee_id,
                    employeeName: record.employee?.user
                      ? `${record.employee.user.first_name} ${record.employee.user.last_name}`
                      : "Unknown Employee",
                    employeeCode: record.employee?.employee_code || "N/A",
                    date:
                      record.shift?.date ||
                      new Date(record.clock_in_time).toISOString().split("T")[0],
                    clockIn: record.clock_in_time,
                    clockOut: record.clock_out_time,
                    status: record.status.toLowerCase(),
                    hoursWorked: record.hours,
                    shiftType: record.shift?.shift_type || "regular",
                    location: record.shift?.client?.business_name || "Remote",
                    method: record.method.toLowerCase(),
                  }))}
                  showAllColumns={true}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Helper functions
function getDefaultAttendanceSummary() {
  return {
    present: 0,
    late: 0,
    absent: 0,
    earlyDepartures: 0,
    clockedInToday: 0,
    onLeaveToday: 0,
    avgWeeklyHours: 0,
    weeklyPresent: 0,
    weeklyLate: 0,
    monthlyWorkedDays: 0,
    monthlyAbsentDays: 0,
    monthlyLeaveDays: 0,
    totalDays: 1, // Prevent division by zero
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