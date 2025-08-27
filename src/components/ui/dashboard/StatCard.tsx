// components/admin/dashboard/StatCard.tsx
import React from "react";

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change = 0,
  secondaryValue,
  secondaryLabel,
  bgColor = "bg-gray-100",
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