// components/admin/dashboard/AlertSection.tsx
import React from "react";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
// import { AlertItem } from "./types";


 type AlertItem = {
  type: "missed_shift" | "on_leave" | "pending_shift" | "client_on_hold";
  title: string;
  priority: "high" | "medium" | "needs_review" | "needs_followup";
  content: any;
};

interface AlertSectionProps {
  title: string;
  items: AlertItem[];
  emptyMessage: string;
}

const priorityConfig = {
  high: {
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-500",
    badge: "bg-red-100 text-red-500",
  },
  medium: {
    bg: "bg-yellow-50",
    border: "border-yellow-100",
    text: "text-yellow-500",
    badge: "bg-yellow-100 text-yellow-600",
  },
  needs_review: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-500",
    badge: "bg-blue-100 text-blue-600",
  },
  needs_followup: {
    bg: "bg-purple-50",
    border: "border-purple-100",
    text: "text-purple-500",
    badge: "bg-purple-100 text-purple-600",
  },
};

export const AlertSection: React.FC<AlertSectionProps> = ({
  title,
  items,
  emptyMessage,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 ${
                priorityConfig[item.priority].bg
              } rounded-lg border ${priorityConfig[item.priority].border}`}
            >
              <div
                className={`mt-0.5 flex-shrink-0 ${
                  priorityConfig[item.priority].text
                }`}
              >
                {item.type === "missed_shift" || item.type === "pending_shift" ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm">{item.title}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      priorityConfig[item.priority].badge
                    }`}
                  >
                    {item.priority === "high"
                      ? "High Priority"
                      : item.priority === "medium"
                      ? "Medium Priority"
                      : item.priority === "needs_review"
                      ? "Needs Review"
                      : "Needs Follow-up"}
                  </span>
                </div>
                {item.type === "missed_shift" || item.type === "pending_shift" ? (
                  <>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.content.client} -{" "}
                      {item.content.date.toLocaleDateString()}
                    </p>
                    {item.type === "missed_shift" && (
                      <p className="text-xs text-gray-600 mt-1">
                        Employees: {item.content.employees.join(", ")}
                      </p>
                    )}
                  </>
                ) : item.type === "on_leave" ? (
                  <p className="text-xs text-gray-600 mt-1">
                    {item.content.name} - Until{" "}
                    {item.content.until?.toLocaleDateString() || "Unknown"}
                  </p>
                ) : (
                  <p className="text-xs text-gray-600 mt-1">
                    {item.content.name} - Last contact:{" "}
                    {item.content.lastContact?.toLocaleDateString() || "Never"}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">All clear</h3>
            <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};