"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ReferenceLine,
} from "recharts";
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  UserCheck,
  Calendar,
  CalendarDays,
} from "lucide-react";

// Types

// Services
import { useAuth } from "@/components/AuthProvider";
import AdminLayout from "../layout/AdminLayout";

// Components
import DateRangeSelector from "@/components/ui/DateRangeSelector";
import { api } from "@/service/api";
import { DashboardResponse } from "@/types/dashboard";
import { DEFAULT_DASHBOARD_RESPONSE } from "@/constants/dashboardDefaults";
import { Skeleton } from "antd";

type TabType = "overview" | "performance" | "alerts";

const COLORS = {
  completed: "#00C49F",
  scheduled: "#8884D8",
  missed: "oklch(70.4% 0.191 22.216)",
  active: "#00C49F",
  on_hold: "#FFBB28",
  inactive: "#FF8042",
};

const AdminDashboard = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
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

  // Update the fetchDashboardData function in the component
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
      console.log(data);
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

  // Data processing functions
  // Example update to weeklyShiftData
  const weeklyShiftData = useMemo(() => {
    if (!shifts.length) return [];

    const result = [];
    const currentDate = new Date(dateRange.from);

    while (currentDate <= dateRange.to) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekShifts = shifts.filter((shift) => {
        const shiftDate = new Date(shift.date);
        return shiftDate >= weekStart && shiftDate <= weekEnd;
      });

      result.push({
        week: `Week ${result.length + 1}`,
        scheduled: weekShifts.filter((s) => s.status === "scheduled").length,
        completed: weekShifts.filter((s) => s.status === "completed").length,
        cancelled: weekShifts.filter((s) => s.status === "missed").length,
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return result;
  }, [shifts, dateRange]);

  const employeePerformanceData = useMemo(() => {
    // First filter out any undefined/null employees
    const validEmployees = employees.filter((emp) => emp?.id);

    return validEmployees.slice(0, 5).map((emp) => {
      // Safe access to user properties with fallbacks
      const firstName = emp?.user?.first_name || "Unknown";
      const lastName = emp?.user?.last_name || "Employee";

      // Safely filter shifts for this employee
      const empShifts = shifts.filter((shift) => {
        return (
          shift?.employeeShifts?.some((es) => es?.employee?.id === emp.id) ??
          false
        );
      });

      // Calculate performance metrics
      const completedShifts = empShifts.filter(
        (s) => s?.status === "completed"
      ).length;
      const cancelledShifts = empShifts.filter(
        (s) => s?.status === "missed"
      ).length;
      const totalShifts = empShifts.length;

      return {
        name: `${firstName} ${lastName}`,
        completed: completedShifts,
        cancelled: cancelledShifts,
        rating:
          totalShifts > 0
            ? Math.min(5, Math.max(1, (completedShifts / totalShifts) * 5))
            : 0,
      };
    });
  }, [employees, shifts]);

  const clientActivityData = useMemo(() => {
    const validClients = clients.filter((client) => client?.id);

    return validClients.slice(0, 5).map((client) => {
      const clientName = client?.business_name || "Unknown Client";

      const clientShifts = shifts.filter((shift) => {
        // Check direct client assignment
        if (shift?.client.id === client.id) return true;

        // Check via employee assignments
        return (
          shift?.employeeShifts?.some((es) =>
            es?.employee?.shifts?.some((s) => s?.client?.id === client.id)
          ) ?? false
        );
      });

      return {
        name: clientName,
        shifts: clientShifts.length,
        completed: clientShifts.filter((s) => s?.status === "completed").length,
        upcoming: clientShifts.filter((s) => {
          try {
            return (
              s?.status === "scheduled" &&
              s?.date &&
              new Date(s.date) > new Date()
            );
          } catch {
            return false;
          }
        }).length,
      };
    });
  }, [clients, shifts]);

  const shiftStatusData = useMemo(
    () => [
      {
        name: "Completed",
        value: shifts.filter((s) => s.status === "completed").length,
      },
      {
        name: "Scheduled",
        value: shifts.filter((s) => s.status === "scheduled").length,
      },
      {
        name: "Missed",
        value: shifts.filter((s) => s.status === "missed").length,
      },
    ],
    [shifts]
  );

  const systemHealthData = useMemo(() => {
    const completedRate = shifts.length
      ? shifts.filter((s) => s.status === "completed").length / shifts.length
      : 0;

    return [
      {
        name: "Performance",
        value: Math.round(completedRate * 100),
        fill:
          completedRate > 0.8
            ? COLORS.completed
            : completedRate > 0.5
            ? COLORS.on_hold
            : COLORS.missed,
      },
    ];
  }, [shifts]);

  const topClients = useMemo(() => {
    return [...clients]
      .map((client) => ({
        ...client,
        shiftCount: shifts.filter((s) => s.client?.id === client.id).length,
      }))
      .sort((a, b) => b.shiftCount - a.shiftCount)
      .slice(0, 5);
  }, [clients, shifts]);

  // Preset date ranges
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
      <AdminLayout>
        <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-6 bg-gray-50">
          <Skeleton />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-6 ">
        {/* Header with Date Range Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-700">
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
                      ? "bg-teal-100 text-teal-600"
                      : "bg-[#e5f0F0] text-teal-600 hover:bg-teal-700 hover:text-white"
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
        {activeTab === "overview" && (
          <>
            {/* Stat Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Employees */}
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees}
                icon={<Users className="h-6 w-6 text-blue-600" />}
                change={
                  stats.totalEmployees - stats.prevPeriodStats.totalEmployees
                }
                bgColor="bg-blue-100"
              />

              {/* Active Clients */}
              <StatCard
                title="Active Clients"
                value={stats.activeClients}
                icon={<Briefcase className="h-6 w-6 text-green-600" />}
                change={
                  stats.activeClients - stats.prevPeriodStats.activeClients
                }
                bgColor="bg-green-100"
              />

              {/* Upcoming Shifts */}
              <StatCard
                title="Upcoming Shifts"
                value={stats.upcomingShifts}
                icon={<Clock className="h-6 w-6 text-purple-600" />}
                secondaryValue={
                  shifts.filter((s) => {
                    const shiftDate = new Date(s.date);
                    const today = new Date();
                    const nextWeek = new Date();
                    nextWeek.setDate(today.getDate() + 7);
                    return shiftDate > today && shiftDate <= nextWeek;
                  }).length
                }
                secondaryLabel="Next 7 days"
                bgColor="bg-purple-100"
              />

              {/* Completion Rate */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold mt-1 text-teal-700">
                      {shifts.length
                        ? Math.round(
                            (stats.completedShifts / shifts.length) * 100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <CompletionRateIcon
                    completed={stats.completedShifts}
                    total={shifts.length}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {stats.completedShifts} of {shifts.length} shifts
                  {stats.prevPeriodStats.completedShifts > 0 && (
                    <span
                      className={`ml-2 ${
                        stats.completedShifts >
                        stats.prevPeriodStats.completedShifts
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      (
                      {stats.completedShifts -
                        stats.prevPeriodStats.completedShifts >
                      0
                        ? "+"
                        : ""}
                      {stats.completedShifts -
                        stats.prevPeriodStats.completedShifts}{" "}
                      from previous period)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shift Activity Chart */}
                <ChartCard
                  title="Shift Activity Over Time"
                  dateRange={`${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`}
                >
                  {weeklyShiftData.length > 0 ? (
                    <AreaChart data={weeklyShiftData}>
                      <defs>
                        <linearGradient
                          id="colorScheduled"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8884d8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorCompleted"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#82ca9d"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#82ca9d"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorCancelled"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ff8042"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ff8042"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="scheduled"
                        stackId="1"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorScheduled)"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stackId="1"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                      />
                      <Area
                        type="monotone"
                        dataKey="cancelled"
                        stackId="1"
                        stroke="#ff8042"
                        fillOpacity={1}
                        fill="url(#colorCancelled)"
                      />
                    </AreaChart>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No shift data available</p>
                    </div>
                  )}
                </ChartCard>

                {/* Recent Activity */}
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-md font-semibold text-gray-800">
                      Recent Activity
                    </h2>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Combined activities with timeline appearance */}
                    {[...(shifts || []), ...(clients || [])]
                      .sort((a, b) => {
                        const dateA = a.date
                          ? new Date(a.date)
                          : a.createdAt
                          ? new Date(a.createdAt)
                          : 0;
                        const dateB = b.date
                          ? new Date(b.date)
                          : b.createdAt
                          ? new Date(b.createdAt)
                          : 0;
                        return dateB - dateA;
                      })
                      .slice(0, 5)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 pb-2 border-b border-gray-100 last:border-0"
                        >
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center pt-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item.status === "completed"
                                  ? "bg-green-500"
                                  : item.status === "active"
                                  ? "bg-blue-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {item !==
                              [...shifts, ...clients].slice(0, 5)[4] && (
                              <div className="w-px h-6 bg-gray-200 mt-1" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-teal-700 truncate">
                              {item.client
                                ? `Shift at ${
                                    item.client.business_name || "Unknown"
                                  }`
                                : `New client: ${
                                    item.business_name || "Unknown"
                                  }`}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {item.employeeShifts
                                ? item.employeeShifts
                                    .map(
                                      (es) =>
                                        `${
                                          es.employee?.user?.first_name ||
                                          "Unknown"
                                        } ${
                                          es.employee?.user?.last_name?.charAt(
                                            0
                                          ) || ""
                                        }`
                                    )
                                    .join(", ")
                                : item.contact_person ||
                                  item.email ||
                                  "No details"}
                            </p>
                            <div className="flex items-center text-xs text-gray-400 mt-0.5">
                              <CalendarDays className="h-3 w-3 mr-1" />
                              <span>
                                {item.date
                                  ? `${new Date(
                                      item.date
                                    ).toLocaleDateString()} • ${
                                      item.start_time || ""
                                    }${
                                      item.end_time ? `-${item.end_time}` : ""
                                    }`
                                  : new Date(
                                      item.createdAt
                                    ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Status badge */}
                          <div
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              item.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : item.status === "active"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.status || "unknown"}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* System Health */}
                <ChartCard title="System Health">
                  <RadialBarChart
                    innerRadius="20%"
                    outerRadius="100%"
                    data={systemHealthData}
                    startAngle={180}
                    endAngle={-180}
                  >
                    <RadialBar
                      label={{ position: "insideStart", fill: "#fff" }}
                      background
                      dataKey="value"
                    />
                    <Legend
                      iconSize={10}
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      payload={[{ value: "Completion Rate", type: "line" }]}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Completion Rate"]}
                    />
                  </RadialBarChart>
                </ChartCard>

                {/* Top Clients */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Top Clients</h2>
                  <div className="space-y-4">
                    {topClients.map((client, index) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center h-8 w-8 rounded-full ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-600"
                                : index === 1
                                ? "bg-gray-100 text-gray-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            <span className="font-medium text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-teal-700">
                              {client.business_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {client.shiftCount} shifts
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={client.status} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shift Status */}
                <ChartCard title="Shift Status">
                  <PieChart>
                    <Pie
                      data={shiftStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {shiftStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS[
                              entry.name.toLowerCase() as keyof typeof COLORS
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} shifts`, "Count"]}
                    />
                  </PieChart>
                </ChartCard>
              </div>
            </div>
          </>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <div className="grid grid-row-1 lg:grid-row-2 gap-6  ">
            {/* Employee Performance */}
            <ChartCard title="Top Performers" className="relative">
              <div className="flex flex-col lg:flex-row gap-6  h-[400px]">
                {/* Chart Area - Takes 70% width on larger screens */}
                <div className="lg:w-[70%] h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={employeePerformanceData}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 20, bottom: 100 }}
                      barSize={24}
                    >
                      {/* Clean grid lines */}
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f5f5f5"
                        horizontal={false}
                      />

                      {/* X Axis with improved styling */}
                      <XAxis
                        type="number"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={{ stroke: "#e2e8f0" }}
                        tickFormatter={(value) => `${value}`}
                      />

                      {/* Y Axis with better name display */}
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={110}
                        tick={{
                          fill: "#334155",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      {/* Enhanced tooltip */}
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255, 255, 255, 0.96)",
                          border: "1px solid rgba(0, 0, 0, 0.05)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          backdropFilter: "blur(4px)",
                          fontSize: "13px",
                        }}
                        formatter={(value, name) => [
                          <span className="font-semibold">{value} shifts</span>,
                          <span
                            className={
                              name === "completed"
                                ? "text-green-600"
                                : "text-amber-600"
                            }
                          >
                            {name === "completed" ? "Completed" : "Missed"}
                          </span>,
                        ]}
                      />

                      {/* Bars with improved visual hierarchy */}
                      <Bar
                        dataKey="completed"
                        name="Completed"
                        fill="#10b981"
                        radius={[0, 6, 6, 0]}
                        animationBegin={100}
                        animationDuration={800}
                      />
                      <Bar
                        dataKey="cancelled"
                        name="Missed"
                        fill="#f59e0b"
                        radius={[0, 6, 6, 0]}
                        animationBegin={300}
                        animationDuration={800}
                      />

                      {/* Reference line with better visibility */}
                      <ReferenceLine
                        x={Math.round(
                          employeePerformanceData.reduce(
                            (sum, emp) => sum + emp.completed,
                            0
                          ) / (employeePerformanceData.length || 1)
                        )}
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{
                          position: "right",
                          value: "Team Avg",
                          fill: "#64748b",
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Performance Metrics Sidebar - Takes 30% width on larger screens */}
                <div className="lg:w-[30%] flex flex-col justify-between space-y-4 p-4 -mt-10 bg-gray-100 rounded-lg">
                  {/* Top Performer Highlight */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">
                      Top Performer
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-medium text-lg">
                          {employeePerformanceData[0]?.name.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {employeePerformanceData[0]?.name.split(" ")[0] ||
                            "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {employeePerformanceData[0]?.completed || 0} completed
                          shifts
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow-xs">
                      <p className="text-xs font-medium text-gray-500">
                        Team Average
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {Math.round(
                          employeePerformanceData.reduce(
                            (sum, emp) => sum + emp.completed,
                            0
                          ) / (employeePerformanceData.length || 1)
                        )}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-xs">
                      <p className="text-xs font-medium text-gray-500">
                        Completion Rate
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {Math.round(
                          (employeePerformanceData.reduce(
                            (sum, emp) => sum + emp.completed,
                            0
                          ) /
                            (employeePerformanceData.reduce(
                              (sum, emp) => sum + emp.completed + emp.cancelled,
                              0
                            ) || 1)) *
                            100
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  {/* Performance Breakdown */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">
                      Shift Completion
                    </h3>
                    <div className="space-y-1">
                      {employeePerformanceData.slice(0, 3).map((emp, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-gray-700 truncate max-w-[120px]">
                            {emp.name.split(" ")[0]}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {emp.completed}
                            </span>
                            <span className="text-xs text-gray-400">/</span>
                            <span className="text-xs text-gray-500">
                              {emp.completed + emp.cancelled}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* Client Activity */}
            <ChartCard title="Client Activity">
              <LineChart
                data={clientActivityData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="shifts"
                  name="Total Shifts"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartCard>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="grid grid-cols-1 gap-6">
            {/* Recent Alerts */}
            <AlertSection
              title="Recent Alerts"
              items={[
                ...shifts
                  .filter((s) => s.status === "missed")
                  .slice(0, 5)
                  .map((shift) => ({
                    type: "missed_shift" as const,
                    title: "Missed Shift",
                    priority: "high" as const,
                    content: {
                      client: shift.client?.business_name || "Unknown Client",
                      date: new Date(shift.date),
                      employees: shift.employeeShifts?.map(
                        (es) =>
                          `${es.employee.user.first_name} ${es.employee.user.last_name}`
                      ) || ["None"],
                    },
                  })),
                ...employees
                  .filter((e) => e.status === "on_leave")
                  .slice(0, 3)
                  .map((emp) => ({
                    type: "on_leave" as const,
                    title: "Employee on Leave",
                    priority: "medium" as const,
                    content: {
                      name: `${emp.user.first_name} ${emp.user.last_name}`,
                      until: emp.termination_date
                        ? new Date(emp.termination_date)
                        : null,
                    },
                  })),
              ]}
              emptyMessage="No active alerts - Everything looks good in your system."
            />

            {/* Pending Actions */}
            <AlertSection
              title="Pending Actions"
              items={[
                ...shifts
                  .filter(
                    (s) =>
                      s.status === "scheduled" && new Date(s.date) < new Date()
                  )
                  .slice(0, 3)
                  .map((shift) => ({
                    type: "pending_shift" as const,
                    title: "Missed Shift",
                    priority: "needs_review" as const,
                    content: {
                      client: shift.client?.business_name || "Unknown Client",
                      date: new Date(shift.date),
                    },
                  })),
                ...clients
                  .filter((c) => c.status === "on_hold")
                  .slice(0, 2)
                  .map((client) => ({
                    type: "client_on_hold" as const,
                    title: "Client On Hold",
                    priority: "needs_followup" as const,
                    content: {
                      name: client.business_name,
                      lastContact: client.last_contact_date
                        ? new Date(client.last_contact_date)
                        : null,
                    },
                  })),
              ]}
              emptyMessage="No pending actions - All tasks are up to date."
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Helper Components
const StatCard = ({
  title,
  value,
  icon,
  change = 0,
  secondaryValue,
  secondaryLabel,
  bgColor = "bg-gray-100",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  secondaryValue?: number | string;
  secondaryLabel?: string;
  bgColor?: string;
}) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1 text-teal-700">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
    </div>
    <div className="mt-2 text-sm text-gray-500">
      {change !== 0 && (
        <span className={change > 0 ? "text-green-500" : "text-red-500"}>
          {change > 0 ? "↑" : "↓"} {Math.abs(change)} from last period
        </span>
      )}
      {secondaryValue && secondaryLabel && (
        <div>
          {secondaryLabel}: {secondaryValue}
        </div>
      )}
    </div>
  </div>
);

const CompletionRateIcon = ({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) => {
  const rate = total ? completed / total : 0;
  const iconClass =
    rate > 0.8
      ? "text-green-600"
      : rate > 0.5
      ? "text-yellow-600"
      : "text-red-600";
  const bgClass =
    rate > 0.8 ? "bg-green-100" : rate > 0.5 ? "bg-yellow-100" : "bg-red-100";

  return (
    <div className={`p-3 rounded-full ${bgClass}`}>
      <CheckCircle className={`h-6 w-6 ${iconClass}`} />
    </div>
  );
};

const ChartCard = ({
  title,
  dateRange,
  children,
}: {
  title: string;
  dateRange?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-4 rounded-lg shadow h-80">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {dateRange && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-500">{dateRange}</span>
        </div>
      )}
    </div>
    <ResponsiveContainer width="100%" height="90%">
      {children}
    </ResponsiveContainer>
  </div>
);

const ActivityItem = ({
  type,
  status,
  title,
  description,
  date,
  time,
}: {
  type: "shift" | "client";
  status?: string;
  title: string;
  description: string;
  date: Date;
  time?: string;
}) => {
  const statusConfig = {
    shift: {
      completed: {
        bg: "bg-green-100",
        text: "text-green-600",
        icon: <CheckCircle className="h-4 w-4" />,
      },
      missed: {
        bg: "bg-red-100",
        text: "text-red-600",
        icon: <AlertCircle className="h-4 w-4" />,
      },
      scheduled: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        icon: <Clock className="h-4 w-4" />,
      },
    },
    client: {
      active: {
        bg: "bg-green-100",
        text: "text-green-600",
        icon: <UserCheck className="h-4 w-4" />,
      },
      default: {
        bg: "bg-gray-100",
        text: "text-gray-600",
        icon: <UserCheck className="h-4 w-4" />,
      },
    },
  };

  const config =
    type === "shift"
      ? statusConfig.shift[status as keyof typeof statusConfig.shift] ||
        statusConfig.shift.scheduled
      : statusConfig.client[status as keyof typeof statusConfig.client] ||
        statusConfig.client.default;

  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg">
      <div className={`mt-1 p-2 rounded-full ${config.bg} ${config.text}`}>
        {config.icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-1">
          {date.toLocaleDateString()}
          {time && ` • ${time}`}
          {status && ` • ${status}`}
        </p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => (
  <div
    className={`text-xs px-2 py-1 rounded-full ${
      status === "active"
        ? "bg-green-50 text-green-600"
        : status === "on_hold"
        ? "bg-yellow-50 text-yellow-600"
        : "bg-gray-50 text-gray-600"
    }`}
  >
    {status}
  </div>
);

const AlertSection = ({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: Array<{
    type: "missed_shift" | "on_leave" | "pending_shift" | "client_on_hold";
    title: string;
    priority: "high" | "medium" | "needs_review" | "needs_followup";
    content: any;
  }>;
  emptyMessage: string;
}) => {
  const priorityConfig = {
    high: {
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-500",
      badge: "bg-red-100 text-red-500",
    },
    medium: {
      bg: "bg-yellow-50",
      border: "border-yellow-100",
      text: "text-yellow-500",
      badge: "bg-yellow-100 text-yellow-600",
    },
    needs_review: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-500",
      badge: "bg-blue-100 text-blue-600",
    },
    needs_followup: {
      bg: "bg-purple-50",
      border: "border-purple-100",
      text: "text-purple-500",
      badge: "bg-purple-100 text-purple-600",
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.priority}
              className={`flex items-start gap-3 p-3 ${
                priorityConfig[item.priority].bg
              } rounded-lg border ${priorityConfig[item.priority].border}`}
            >
              <div
                className={`mt-0.5 flex-shrink-0 ${
                  priorityConfig[item.priority].text
                }`}
              >
                {item.type === "missed_shift" ||
                item.type === "pending_shift" ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm">{item.title}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      priorityConfig[item.priority].badge
                    }`}
                  >
                    {item.priority === "high"
                      ? "High Priority"
                      : item.priority === "medium"
                      ? "Medium Priority"
                      : item.priority === "needs_review"
                      ? "Needs Review"
                      : "Needs Follow-up"}
                  </span>
                </div>
                {item.type === "missed_shift" ||
                item.type === "pending_shift" ? (
                  <>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.content.client} -{" "}
                      {item.content.date.toLocaleDateString()}
                    </p>
                    {item.type === "missed_shift" && (
                      <p className="text-xs text-gray-600 mt-1">
                        Employees: {item.content.employees.join(", ")}
                      </p>
                    )}
                  </>
                ) : item.type === "on_leave" ? (
                  <p className="text-xs text-gray-600 mt-1">
                    {item.content.name} - Until{" "}
                    {item.content.until?.toLocaleDateString() || "Unknown"}
                  </p>
                ) : (
                  <p className="text-xs text-gray-600 mt-1">
                    {item.content.name} - Last contact:{" "}
                    {item.content.lastContact?.toLocaleDateString() || "Never"}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">All clear</h3>
            <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
