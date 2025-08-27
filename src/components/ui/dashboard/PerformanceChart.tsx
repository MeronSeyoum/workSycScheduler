import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Shift } from "@/lib/types/dashboard";
import { Employee } from "@/lib/types/employee";

interface PerformanceChartProps {
  employees: Employee[];
  shifts: Shift[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  employees,
  shifts,
}) => {
  const employeePerformanceData = useMemo(() => {
    const validEmployees = employees.filter((emp) => emp?.id);

    return validEmployees.slice(0, 5).map((emp) => {
      const firstName = emp?.user?.first_name || "Unknown";
      const lastName = emp?.user?.last_name || "Employee";

      const empShifts = shifts.filter((shift) => {
        return (
          shift?.employeeShifts?.some((es) => es?.employee?.id === emp.id) ??
          false
        );
      });

      const completedShifts = empShifts.filter(
        (s) => s?.status === "completed"
      ).length;
      const missedShifts = empShifts.filter(
        (s) => s?.status === "missed"
      ).length;
      const totalShifts = empShifts.length;

      return {
        name: `${firstName} ${lastName}`,
        completed: completedShifts,
        missed: missedShifts,
        rating:
          totalShifts > 0
            ? Math.min(5, Math.max(1, (completedShifts / totalShifts) * 5))
            : 0,
      };
    });
  }, [employees, shifts]);

  const teamAverage = Math.round(
    employeePerformanceData.reduce((sum, emp) => sum + emp.completed, 0) /
      (employeePerformanceData.length || 1)
  );

  const completionRate = Math.round(
    (employeePerformanceData.reduce((sum, emp) => sum + emp.completed, 0) /
      (employeePerformanceData.reduce(
        (sum, emp) => sum + emp.completed + emp.missed,
        0
      ) || 1)) *
      100
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[300px] w-full">
      {/* Chart Area */}
      <div className="lg:w-[70%] h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={employeePerformanceData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barSize={24}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f5f5f5"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{
                fill: "#334155",
                fontSize: 12,
                fontWeight: 500,
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(255, 255, 255, 0.96)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
            <Legend />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="#10b981"
              radius={[0, 6, 6, 0]}
              animationBegin={100}
              animationDuration={800}
            />
            <Bar
              dataKey="missed"
              name="Missed"
              fill="#f59e0b"
              radius={[0, 6, 6, 0]}
              animationBegin={300}
              animationDuration={800}
            />
            <ReferenceLine
              x={teamAverage}
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

      {/* Performance Metrics Sidebar */}
      <div className="lg:w-[30%] flex flex-col justify-between space-y-4 p-4 bg-gray-100 rounded-lg">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Top Performer</h3>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-medium text-lg">
                {employeePerformanceData[0]?.name.charAt(0) || "?"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {employeePerformanceData[0]?.name.split(" ")[0] || "N/A"}
              </p>
              <p className="text-sm text-gray-500">
                {employeePerformanceData[0]?.completed || 0} completed shifts
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg shadow-xs">
            <p className="text-xs font-medium text-gray-500">Team Average</p>
            <p className="text-xl font-bold text-gray-900">
              {teamAverage}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-xs">
            <p className="text-xs font-medium text-gray-500">Completion Rate</p>
            <p className="text-xl font-bold text-gray-900">
              {completionRate}%
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Shift Completion</h3>
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
                    {emp.completed + emp.missed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};