import React from "react";
import { ChartCard } from "./ChartCard";
import { PerformanceChart } from "./PerformanceChart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Client, Shift } from "@/lib/types/dashboard";

interface PerformanceTabProps {
  employees: any[];
  shifts: Shift[];
  clients: Client[];
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({
  employees,
  shifts,
  clients,
}) => {
  const clientActivityData = clients.slice(0, 5).map((client) => {
    const clientName = client?.business_name || "Unknown Client";
    const clientShifts = shifts.filter((shift) => shift?.client.id === client.id);
    
    return {
      name: clientName,
      shifts: clientShifts.length,
      completed: clientShifts.filter((s) => s?.status === "completed").length,
      upcoming: clientShifts.filter((s) => {
        try {
          return (
            s?.status === "scheduled" &&
            s?.date &&
            new Date(s.date) > new Date()
          );
        } catch {
          return false;
        }
      }).length,
    };
  });

  return (
    <div className="grid grid-row-1 lg:grid-row-2 gap-6">
      <ChartCard title="Top Performers">
        <PerformanceChart employees={employees} shifts={shifts} />
      </ChartCard>

      <ChartCard title="Client Activity">
                <ResponsiveContainer width="100%" height="100%">
        
        <LineChart
          data={clientActivityData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="shifts"
            name="Total Shifts"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};