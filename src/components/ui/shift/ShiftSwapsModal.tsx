import React from "react";
import { Modal, Button } from "antd";
import { FaExchangeAlt } from "react-icons/fa";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/common/badge";
import { Employee } from "@/lib/types/employee";

interface ShiftSwapRequest {
  id: number;
  shift_id: number;
  requester_id: number;
  requested_employee_id: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
  created_at: string;
}

interface ShiftSwapsModalProps {
  visible: boolean;
  swapRequests: ShiftSwapRequest[];
  employees: Employee[];
  onClose: () => void;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
  getEmployeeFullName: (employee: Employee) => string;
}

export const ShiftSwapsModal: React.FC<ShiftSwapsModalProps> = ({
  visible,
  swapRequests,
  employees,
  onClose,
  onApprove,
  onReject,
  getEmployeeFullName,
}) => {
  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? getEmployeeFullName(employee) : "Unknown";
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FaExchangeAlt className="text-purple-500" />
          <span>Shift Swap Requests</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div className="space-y-3">
        {swapRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending shift swap requests
          </div>
        ) : (
          swapRequests.map((request) => (
            <div
              key={request.id}
              className="p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        request.status === "pending"
                          ? "default"
                          : request.status === "approved"
                          ? "success"
                          : "destructive"
                      }
                    >
                      {request.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {dayjs(request.created_at).format("MMM D, YYYY h:mm A")}
                    </span>
                  </div>

                  <p className="text-sm">
                    <span className="font-medium">
                      {getEmployeeName(request.requester_id)}
                    </span>
                    {" wants to swap with "}
                    <span className="font-medium">
                      {getEmployeeName(request.requested_employee_id)}
                    </span>
                  </p>

                  {request.reason && (
                    <p className="text-sm text-gray-600 mt-1">
                      Reason: {request.reason}
                    </p>
                  )}
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      onClick={() => onApprove(request.id)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      onClick={() => onReject(request.id)}
                      className="text-red-500 border-red-300 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};