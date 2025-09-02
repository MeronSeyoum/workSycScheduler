import React from "react";
import { Modal, Button } from "antd";
import { FaClock } from "react-icons/fa";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/common/badge";

interface OpenShift {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  location: string;
  required_skills: string[];
}

interface OpenShiftsModalProps {
  visible: boolean;
  openShifts: OpenShift[];
  onClose: () => void;
  onClaim: (shiftId: number) => void;
}

export const OpenShiftsModal: React.FC<OpenShiftsModalProps> = ({
  visible,
  openShifts,
  onClose,
  onClaim,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FaClock className="text-green-500" />
          <span>Open Shifts</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <div className="space-y-3">
        {openShifts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No open shifts available
          </div>
        ) : (
          openShifts.map((shift) => (
            <div
              key={shift.id}
              className="p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{shift.position}</h4>
                  <p className="text-sm text-gray-600">
                    {dayjs(shift.date).format("MMM D, YYYY")} • {shift.start_time}{" "}
                    - {shift.end_time}
                  </p>
                  <p className="text-xs text-gray-500">{shift.location}</p>
                </div>
                <Button
                  size="small"
                  onClick={() => onClaim(shift.id)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Claim Shift
                </Button>
              </div>

              {shift.required_skills.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    Required skills:{" "}
                  </span>
                  {shift.required_skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="mr-1 text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};