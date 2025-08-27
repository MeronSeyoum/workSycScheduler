import React from "react";
import { AlertSection } from "./AlertSection";
import { Shift, Employee, Client } from "@/lib/types/dashboard";

interface AlertsTabProps {
  shifts: Shift[];
  employees: Employee[];
  clients: Client[];
}

export const AlertsTab: React.FC<AlertsTabProps> = ({
  shifts,
  employees,
  clients,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <AlertSection
        title="Recent Alerts"
        items={[
          ...shifts
            .filter((s) => s.status === "missed")
            .slice(0, 5)
            .map((shift) => ({
              type: "missed_shift",
              title: "Missed Shift",
              priority: "high",
              content: {
                client: shift.client?.business_name || "Unknown Client",
                date: new Date(shift.date),
                employees: shift.employeeShifts?.map(
                  (es) =>
                    `${es.employee.user.first_name} ${es.employee.user.last_name}`
                ) || ["None"],
              },
            })),
          ...employees
            .filter((e) => e.status === "on_leave")
            .slice(0, 3)
            .map((emp) => ({
              type: "on_leave",
              title: "Employee on Leave",
              priority: "medium",
              content: {
                name: `${emp.user.first_name} ${emp.user.last_name}`,
                until: emp.termination_date
                  ? new Date(emp.termination_date)
                  : null,
              },
            })),
        ]}
        emptyMessage="No active alerts - Everything looks good in your system."
      />

      <AlertSection
        title="Pending Actions"
        items={[
          ...shifts
            .filter(
              (s) => s.status === "scheduled" && new Date(s.date) < new Date()
            )
            .slice(0, 3)
            .map((shift) => ({
              type: "pending_shift",
              title: "Missed Shift",
              priority: "needs_review",
              content: {
                client: shift.client?.business_name || "Unknown Client",
                date: new Date(shift.date),
              },
            })),
          ...clients
            .filter((c) => c.status === "on_hold")
            .slice(0, 2)
            .map((client) => ({
              type: "client_on_hold",
              title: "Client On Hold",
              priority: "needs_followup",
              content: {
                name: client.business_name,
                lastContact: client.createdAt
                  ? new Date(client.createdAt)
                  : null,
              },
            })),
        ]}
        emptyMessage="No pending actions - All tasks are up to date."
      />
    </div>
  );
};