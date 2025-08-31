// components/admin/dashboard/ChartCard.tsx
import React from "react";
import { Calendar } from "lucide-react";

interface ChartCardProps {
  title: string;
  dateRange?: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  dateRange,
  children,
}) => (
  <div className="bg-white p-4 rounded-lg shadow h-96  ">
    <div className="flex justify-between items-center ">
      <h2 className="text-lg font-semibold">{title}</h2>
      {dateRange && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-500">{dateRange}</span>
        </div>
      )}
    </div>
    {/* <ResponsiveContainer width="100%" height="100%"> */}
      {children as React.ReactElement}
    {/* </ResponsiveContainer> */}
  </div>
);