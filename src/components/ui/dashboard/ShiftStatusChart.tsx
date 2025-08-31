import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface ShiftStatusChartProps {
  shifts: any[];
}

export const COLORS = {
  completed: "#00C49F",
  scheduled: "#8884D8",
  missed: "oklch(70.4% 0.191 22.216)",
  active: "#00C49F",
  on_hold: "#FFBB28",
  inactive: "#FF8042",
};

export const ShiftStatusChart: React.FC<ShiftStatusChartProps> = ({ shifts }) => {
  const shiftStatusData = [
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
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart
        margin={{
          top: 20,
          right: 50,
          bottom: 20,
          left: 20
        }}
      >
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
            // Add null check for percent
            `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
          }
        >
          {shiftStatusData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} shifts`, "Count"]} />
      </PieChart>
    </ResponsiveContainer>
  );
};