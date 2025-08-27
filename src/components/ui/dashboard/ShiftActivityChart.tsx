// components/admin/dashboard/ShiftActivityChart.tsx
import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Shift } from "@/lib/types/dashboard";

interface ShiftActivityChartProps {
  shifts: Shift[];
  dateRange: { from: Date; to: Date };
}

export const ShiftActivityChart: React.FC<ShiftActivityChartProps> = ({
  shifts,
  dateRange,
}) => {
  const weeklyShiftData = useMemo(() => {
    if (!shifts?.length) return [];

    // Clone dates to avoid mutation
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);

    // Normalize dates (set to noon to avoid timezone issues)
    startDate.setHours(12, 0, 0, 0);
    endDate.setHours(12, 0, 0, 0);

    const result = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekShifts = shifts.filter((shift) => {
        try {
          const shiftDate = new Date(shift.date);
          shiftDate.setHours(12, 0, 0, 0); // Normalize shift time
          return shiftDate >= weekStart && shiftDate <= weekEnd;
        } catch (e) {
          console.error("Invalid date format:", shift.date);
          return false;
        }
      });

      result.push({
        name: `Week ${result.length + 1}`, // Changed from 'week' to 'name' for better recharts compatibility
        scheduled: weekShifts.filter((s) => s.status === "scheduled").length,
        completed: weekShifts.filter((s) => s.status === "completed").length,
        missed: weekShifts.filter((s) => s.status === "missed").length,
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return result;
  }, [shifts, dateRange]);

  if (!weeklyShiftData?.length) {
    return (
      <div className="flex items-center justify-center h-full ">
        <p className="text-gray-500">
          No shift data available for the selected period
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={weeklyShiftData}
        margin={{ top: 0, right: 10, left: 0, bottom: 30 }}
      >
        <defs>
          <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorMissed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff8042" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#ff8042" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{
            value: "Number of Shifts",
            angle: -90,
            position: "insideLeft",
            fontSize: 12,
          }}
        />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="scheduled"
          name="Scheduled"
          stackId="1"
          stroke="#3b82f6"
          fill="url(#colorScheduled)"
        />
        <Area
          type="monotone"
          dataKey="completed"
          name="Completed"
          stackId="1"
          stroke="#82ca9d"
          fill="url(#colorCompleted)"
        />
        <Area
          type="monotone"
          dataKey="missed"
          name="Missed"
          stackId="1"
          stroke="#ff8042"
          fill="url(#colorMissed)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
