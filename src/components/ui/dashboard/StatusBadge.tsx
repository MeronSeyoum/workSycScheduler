// components/admin/dashboard/StatusBadge.tsx
import React from "react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
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