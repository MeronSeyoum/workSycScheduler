import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label
} from "recharts";

interface ShiftStatusChartProps {
  shifts: any[];
  showLegend?: boolean;
  showCenterLabel?: boolean;
  compact?: boolean;
}

export const COLORS = {
  completed: "#10b981", // Green-500
  scheduled: "#3b82f6", // Blue-500
  missed: "#ef4444",    // Red-500
  cancelled: "#6b7280", // Gray-500
  in_progress: "#f59e0b", // Amber-500
  pending: "#8b5cf6"    // Purple-500
};

export const STATUS_DISPLAY_NAMES = {
  completed: "Completed",
  scheduled: "Scheduled",
  missed: "Missed",
  cancelled: "Cancelled",
  in_progress: "In Progress",
  pending: "Pending"
};

export const ShiftStatusChart: React.FC<ShiftStatusChartProps> = ({ 
  shifts, 
  showLegend = true,
  showCenterLabel = true,
  compact = false 
}) => {
  const shiftStatusData = useMemo(() => {
    const statusCounts = shifts.reduce((acc, shift) => {
      const status = shift.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and filter out zero values
    return Object.entries(statusCounts)
      .map(([name, value]) => ({
        name: STATUS_DISPLAY_NAMES[name as keyof typeof STATUS_DISPLAY_NAMES] || name,
        value: value as number, // Explicitly type value as number
        statusKey: name,
        percentage: shifts.length ? ((value as number) / shifts.length) * 100 : 0 // Cast value here too
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [shifts]);

  const totalShifts = shifts.length;
  const completedShifts = shiftStatusData.find(item => item.statusKey === 'completed')?.value || 0;
  const completionRate = totalShifts ? Math.round((completedShifts / totalShifts) * 100) : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-[140px]">
          <p className="text-sm font-semibold text-gray-800 mb-1">{data.name}</p>
          <p className="text-lg font-bold text-gray-900">{data.value} shifts</p>
          <p className="text-xs text-gray-600">
            {data.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name
  }: any) => {
    if (!compact && percent > 0.05) { // Only show label if segment is large enough
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          className="text-xs font-medium drop-shadow-md"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    }
    return null;
  };

  const CenterLabel = () => (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      className="fill-gray-800"
      style={{
        fontSize: compact ? '12px' : '14px',
        fontWeight: 'bold'
      }}
    >
      {compact ? `${completionRate}%` : `Completion\n${completionRate}%`}
    </text>
  );

  if (totalShifts === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">No shift data</p>
          <p className="text-xs">available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] flex flex-col">
      {/* Chart Header - Hidden in compact mode */}
      {!compact && (
        <div className="text-center mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Shift Status</h3>
          <p className="text-xs text-gray-500">{totalShifts} total shifts</p>
        </div>
      )}

      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={compact ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: 10, right: 10, bottom: 10, left: 10 }}>
            <Pie
              data={shiftStatusData}
              cx="50%"
              cy="50%"
              innerRadius={compact ? "60%" : "50%"}
              outerRadius={compact ? "80%" : "90%"}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={!compact ? renderCustomizedLabel : false}
              labelLine={false}
            >
              {shiftStatusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.statusKey as keyof typeof COLORS] || "#6b7280"}
                />
              ))}
              {showCenterLabel && <Label content={<CenterLabel />} />}
            </Pie>
            
            <Tooltip content={<CustomTooltip />} />

            {showLegend && !compact && (
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value, entry) => (
                  <span className="text-xs text-gray-600">
                    {value}
                  </span>
                )}
                wrapperStyle={{
                  paddingTop: '10px',
                  fontSize: '12px'
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Compact Stats - Only shown in compact mode */}
      {compact && (
        <div className="mt-2 text-center">
          <div className="text-xs text-gray-700 font-medium">
            {completionRate}% Complete
          </div>
          <div className="text-xs text-gray-500">
            {completedShifts}/{totalShifts} shifts
          </div>
        </div>
      )}
    </div>
  );
};

// Additional helper component for status badges
export const ShiftStatusBadge: React.FC<{ status: string; compact?: boolean }> = ({ 
  status, 
  compact = false 
}) => {
  const statusKey = status.toLowerCase() as keyof typeof COLORS;
  const displayName = STATUS_DISPLAY_NAMES[statusKey] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        compact ? 'px-1.5 py-0.5' : 'px-2 py-1'
      }`}
      style={{
        backgroundColor: `${COLORS[statusKey] || '#6b7280'}20`,
        color: COLORS[statusKey] || '#6b7280',
        border: `1px solid ${COLORS[statusKey] || '#6b7280'}40`
      }}
    >
      {displayName}
    </span>
  );
};

// Status summary component
export const ShiftStatusSummary: React.FC<{ shifts: any[] }> = ({ shifts }) => {
  const statusData = useMemo(() => {
    return shifts.reduce((acc: Record<string, number>, shift) => { // Add type annotation here
      const status = shift.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>); // And here
  }, [shifts]);

  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
      {Object.entries(statusData).map(([status, count]) => (
        <div key={status} className="flex items-center justify-between">
          <ShiftStatusBadge status={status} compact />
          <span className="text-sm font-semibold text-gray-800">{count}</span>
        </div>
      ))}
    </div>
  );
};