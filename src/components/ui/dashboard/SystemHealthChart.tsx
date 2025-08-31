import React, { useMemo } from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Shift } from "@/lib/types/dashboard";

interface SystemHealthChartProps {
  shifts: Shift[];
}
export const COLORS = {
  completed: "#00C49F",
  scheduled: "#8884D8",
  missed: "oklch(70.4% 0.191 22.216)",
  active: "#00C49F",
  on_hold: "#FFBB28",
  inactive: "#FF8042",
};

export const SystemHealthChart: React.FC<SystemHealthChartProps> = ({
  shifts,
}) => {
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        innerRadius="20%"
        outerRadius="100%"
        data={systemHealthData}
        startAngle={180}
        endAngle={-180}
      >
        <RadialBar
          // Remove minAngle prop as it doesn't exist in current Recharts version
          label={{
            position: 'insideStart',
            fill: '#fff',
            fontSize: 12,
            fontWeight: 'bold'
          }}
          background={{ fill: '#f5f5f5' }}
          dataKey="value"
          cornerRadius={8}
        />
        <Legend
          iconSize={12}
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            lineHeight: '24px'
          }}
          formatter={(value) => (
            <span style={{ color: '#333', fontSize: 12 }}>Completion Rate</span>
          )}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(255, 255, 255, 0.96)',
            border: '1px solid #e5e5e5',
            borderRadius: 6,
            padding: '8px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          itemStyle={{
            color: '#333',
            fontSize: 12,
            fontWeight: 'bold'
          }}
          labelStyle={{
            color: '#666',
            fontSize: 12,
            marginBottom: 4
          }}
          formatter={(value) => [`${value}%`, "Completion Rate"]}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#333"
          style={{
            fontSize: 24,
            fontWeight: 'bold'
          }}
        >
          {systemHealthData[0]?.value}%
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
};