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
  completed: "#10b981", // Green-500
  scheduled: "#3b82f6", // Blue-500
  missed: "#ef4444",    // Red-500
  active: "#10b981",    // Green-500
  on_hold: "#f59e0b",   // Amber-500
  inactive: "#6b7280",  // Gray-500
};

export const SystemHealthChart: React.FC<SystemHealthChartProps> = ({
  shifts,
}) => {
  const { completionRate, performanceLevel } = useMemo(() => {
    const completedShifts = shifts.filter((s) => s.status === "completed").length;
    const totalShifts = shifts.length;
    const completionRate = totalShifts ? Math.round((completedShifts / totalShifts) * 100) : 0;

    let performanceLevel: "excellent" | "good" | "poor";
    if (completionRate >= 90) performanceLevel = "excellent";
    else if (completionRate >= 70) performanceLevel = "good";
    else performanceLevel = "poor";

    return { completionRate, performanceLevel };
  }, [shifts]);

  const systemHealthData = [
    {
      name: "Completion Rate",
      value: completionRate,
      fill: 
        performanceLevel === "excellent" ? COLORS.completed :
        performanceLevel === "good" ? COLORS.on_hold :
        COLORS.missed,
    },
  ];

  const getPerformanceLabel = () => {
    switch (performanceLevel) {
      case "excellent": return "Excellent";
      case "good": return "Good";
      case "poor": return "Needs Improvement";
      default: return "";
    }
  };

  return (
    <div className="w-full h-[300px] flex flex-col">
      {/* Mobile Header - Only shows on small screens */}
      <div className="lg:hidden mb-3 text-center">
        <h3 className="text-sm font-semibold text-gray-700">Completion Rate</h3>
        <p className="text-xs text-gray-500">{getPerformanceLabel()}</p>
      </div>

      <div className="flex-1 relative ">
        <ResponsiveContainer width="100%" height="100%">
       <RadialBarChart
  innerRadius="30%"    // Reduced from 30% - makes hole smaller
  outerRadius="100%"   // Increased from 90% - makes bar reach edge
  data={systemHealthData}
  startAngle={180}
  endAngle={-180}
  margin={{
    top: 5,           // Reduced margins
    right: 5,
    left: 5,
    bottom: 5,
  }}
>
            <RadialBar
              background={{ fill: '#f3f4f6', radius: 4 }}
              dataKey="value"
              cornerRadius={6}
              fill={systemHealthData[0].fill}
            >
              {/* Custom labels for different screen sizes */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-800"
                style={{
                  fontSize: 'clamp(16px, 3vw, 24px)',
                  fontWeight: 'bold'
                }}
              >
                {completionRate}%
              </text>
            </RadialBar>
            
            {/* Desktop Legend */}
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                lineHeight: '20px',
                display: window.innerWidth < 1024 ? 'none' : 'block'
              }}
              formatter={() => (
                <span className="text-xs text-gray-600">Completion Rate</span>
              )}
            />

            {/* Mobile Performance Indicator */}
            {window.innerWidth < 1024 && (
              <text
                x="50%"
                y="65%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-600"
                style={{ fontSize: '12px' }}
              >
                {getPerformanceLabel()}
              </text>
            )}

            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">
                        Completion Rate
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {payload[0].value}%
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {shifts.length} total shifts
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Indicators - Bottom section */}
      <div className="mt-3 lg:mt-4">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>0%</span>
          <span className="text-center flex-1 px-2">
            <span className={`font-medium ${
              performanceLevel === "excellent" ? "text-green-600" :
              performanceLevel === "good" ? "text-amber-600" :
              "text-red-600"
            }`}>
              {getPerformanceLabel()}
            </span>
          </span>
          <span>100%</span>
        </div>
        
        {/* Performance scale bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${completionRate}%`,
              backgroundColor: systemHealthData[0].fill
            }}
          />
        </div>
        
        {/* Stats summary - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:flex items-center justify-between text-xs text-gray-500 mt-2">
          <span>Completed: {shifts.filter(s => s.status === "completed").length}</span>
          <span>Total: {shifts.length}</span>
        </div>
      </div>
    </div>
  );
};