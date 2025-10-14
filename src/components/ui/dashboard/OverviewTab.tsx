import React, { useMemo } from "react";
import {
  Users,
  Briefcase,
  Clock,
  CalendarDays,
  ChevronRight,

} from "lucide-react";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { ShiftActivityChart } from "./ShiftActivityChart";
import { SystemHealthChart } from "./SystemHealthChart";
import { TopClients } from "./TopClients";
import { DashboardResponse } from "@/lib/types/dashboard";
import { ShiftStatusChart } from "./ShiftStatusChart";
import DashboardHelpRequests from "./DashboardHelpRequests";

interface OverviewTabProps {
  stats: DashboardResponse["stats"];
  shifts: DashboardResponse["shifts"];
  clients: DashboardResponse["clients"];
  dateRange: { from: Date; to: Date };
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  shifts,
  clients,
  dateRange,
}) => {
  // Memoize upcoming shifts calculation
  const upcomingShiftsNext7Days = useMemo(() => {
    return shifts.filter((s) => {
      try {
        const shiftDate = new Date(s.date);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        // Normalize times for comparison
        shiftDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        nextWeek.setHours(23, 59, 59, 999);

        return shiftDate > today && shiftDate <= nextWeek;
      } catch (e) {
        console.error("Invalid date format in shift:", s.date);
        return false;
      }
    }).length;
  }, [shifts]);

  // Memoize recent activity items
  const recentActivityItems = useMemo(() => {
    return [...shifts, ...clients]
      .sort((a, b) => {
        const getDate = (item: any) => {
          try {
            return new Date(
              "date" in item
                ? item.date
                : "createdAt" in item
                ? item.createdAt
                : new Date(0)
            ).getTime();
          } catch (e) {
            console.error("Error parsing date:", e);
            return 0;
          }
        };
        return getDate(b) - getDate(a);
      })
      .slice(0, 5);
  }, [shifts, clients]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stat Overview - Compact spacing */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Employees"
          value={stats.totalEmployees}
          icon={<Users className="h-4 w-4 text-blue-600" />}
          change={stats.totalEmployees - stats.prevPeriodStats.totalEmployees}
          bgColor="bg-blue-100"
          
        />

        <StatCard
          title="Clients"
          value={stats.activeClients}
          icon={<Briefcase className="h-4 w-4 text-green-600" />}
          change={stats.activeClients - stats.prevPeriodStats.activeClients}
          bgColor="bg-green-100"
          
        />

        <StatCard
          title="Upcoming"
          value={stats.upcomingShifts}
          icon={<Clock className="h-4 w-4 text-purple-600" />}
          secondaryValue={upcomingShiftsNext7Days}
          secondaryLabel="7 days"
          bgColor="bg-purple-100"
          
        />
        
        <StatCard
          title="Completion"
          bgColor="bg-white"
          completionRate={{
            completed: stats.completedShifts,
            total: shifts.length,
            prevCompleted: stats.prevPeriodStats.completedShifts
          }}
          
        />
      </div>

      {/* Main Content - Optimized spacing */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left Column - Charts */}
        <div className="xl:col-span-2 space-y-4">
          <ChartCard
            title="Shift Activity"
            dateRange={`${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`}
            
          >
            <ShiftActivityChart shifts={shifts} dateRange={dateRange} />
          </ChartCard>

         
          {/* Recent Activity - More compact */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-800">
                Recent Activity
              </h2>
              <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </button>
            </div>

            <div className="space-y-1">
              {recentActivityItems.map((item) => {
                const isShift = "date" in item;
                const status = isShift ? item.status : "new";

                return (
                  <ActivityItem
                    key={item.id}
                    isShift={isShift}
                    item={item}
                    status={status}
                  />
                );
              })}
            </div>
          </div>

           {/* Help Requests - Moved to main content area for better space usage */}
          <DashboardHelpRequests maxItems={4} />

        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          <ChartCard title="Shift Status">
            <div className="h-32">
              <ShiftStatusChart shifts={shifts} />
            </div>
          </ChartCard>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold mb-2">Top Clients</h2>
            <TopClients clients={clients} shifts={shifts}  />
          </div>

          <ChartCard title="Completion Rate" >
            <div className="h-32">
              <SystemHealthChart shifts={shifts} />
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

// More compact ActivityItem component
const ActivityItem = ({
  isShift,
  item,
  status,
}: {
  isShift: boolean;
  item: any;
  status: string;
}) => {
  const getStatusColor = () => {
    if (!isShift) return "bg-purple-500";
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "scheduled":
        return "bg-blue-500";
      case "missed":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusBadgeClass = () => {
    if (!isShift) return "bg-purple-100 text-purple-800";
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "missed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex items-start gap-2 py-1 border-b border-gray-100 last:border-0">
      <div className="flex flex-col items-center pt-0.5">
        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor()}`} />
        <div className="w-px h-4 bg-gray-200 mt-0.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-900 truncate">
          {isShift
            ? `Shift at ${item.client?.business_name || "Unknown"}`
            : `New client: ${item.business_name || "Unknown"}`}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {isShift
            ? item.employeeShifts
                ?.map(
                  (es: any) =>
                    `${es.employee?.user?.first_name || "Unknown"} ${
                      es.employee?.user?.last_name?.charAt(0) || ""
                    }`
                )
                ?.join(", ") || "No employees assigned"
            : item.contact_person || item.email || "No details"}
        </p>
        <div className="flex items-center text-xs text-gray-400 mt-0.5">
          <CalendarDays className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
          <span className="truncate">
            {isShift
              ? `${new Date(item.date).toLocaleDateString()} • ${
                  item.start_time || ""
                }${item.end_time ? `-${item.end_time}` : ""}`
              : new Date(item.createdAt || new Date()).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div
        className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusBadgeClass()} flex-shrink-0 text-xs`}
      >
        {isShift ? status || "unknown" : "new client"}
      </div>
    </div>
  );
};

export default OverviewTab;