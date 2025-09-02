import React from "react";
import { Modal, Alert } from "antd";
import { ShiftWithEmployees } from "@/lib/types/shift";

interface EditShiftTimeModalProps {
  visible: boolean;
  shift: ShiftWithEmployees | null;
  newTime: { start: string; end: string };
  error: string | null;
  loading: boolean;
  onOk: () => void;
  onCancel: () => void;
  onTimeChange: (type: 'start' | 'end', value: string) => void;
}

export const EditShiftTimeModal: React.FC<EditShiftTimeModalProps> = ({
  visible,
  shift,
  newTime,
  error,
  loading,
  onOk,
  onCancel,
  onTimeChange,
}) => {
  return (
    <Modal
      title="Edit Shift Time"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Save Changes"
      cancelText="Cancel"
      confirmLoading={loading}
      width={400}
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          padding: "16px 24px",
        },
        body: { padding: "24px" },
        footer: {
          borderTop: "1px solid #f0f0f0",
          padding: "16px 24px",
        },
      }}
      className="rounded-lg"
    >
      {shift && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={newTime.start}
                onChange={(e) => onTimeChange('start', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={newTime.end}
                onChange={(e) => onTimeChange('end', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="mt-2 rounded-lg"
            />
          )}
        </div>
      )}
    </Modal>
  );
};