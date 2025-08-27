import React, { useMemo } from "react";
import { Client, Shift } from "@/lib/types/dashboard";
import { StatusBadge } from "./StatusBadge";

interface TopClientsProps {
  clients: Client[];
  shifts: Shift[];
}

export const TopClients: React.FC<TopClientsProps> = ({ clients, shifts }) => {
  const topClients = useMemo(() => {
    return [...clients]
      .map((client) => ({
        ...client,
        shiftCount: shifts.filter((s) => s.client?.id === client.id).length,
      }))
      .sort((a, b) => b.shiftCount - a.shiftCount)
      .slice(0, 5);
  }, [clients, shifts]);

  return (
    <div className="space-y-4">
      {topClients.map((client, index) => (
        <div
          key={client.id}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                index === 0
                  ? "bg-yellow-100 text-yellow-600"
                  : index === 1
                  ? "bg-gray-100 text-gray-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              <span className="font-medium text-sm">{index + 1}</span>
            </div>
            <div>
              <p className="font-medium text-sm text-teal-700">
                {client.business_name}
              </p>
              <p className="text-xs text-gray-500">
                {client.shiftCount} shifts
              </p>
            </div>
          </div>
          <StatusBadge status={client.status} />
        </div>
      ))}
    </div>
  );
};