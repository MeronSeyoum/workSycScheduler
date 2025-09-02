import React, { useState } from "react";
import { Modal, Checkbox } from "antd";
import { FaRobot } from "react-icons/fa";

const AI_SCHEDULING_OPTIONS = [
  { key: "fairness", label: "Optimize for fairness" },
  { key: "cost", label: "Optimize for labor cost" },
  { key: "skills", label: "Match skills & qualifications" },
  { key: "preferences", label: "Consider employee preferences" },
];

interface AISchedulerModalProps {
  visible: boolean;
  onCancel: () => void;
  onGenerate: (options: string[]) => void;
  loading: boolean;
}

export const AISchedulerModal: React.FC<AISchedulerModalProps> = ({
  visible,
  onCancel,
  onGenerate,
  loading,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FaRobot className="text-blue-500" />
          <span>AI Schedule Generator</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={() => onGenerate(selectedOptions)}
      confirmLoading={loading}
      width={500}
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Generate an optimized schedule based on your criteria:
        </p>

        <div className="grid gap-2">
          {AI_SCHEDULING_OPTIONS.map((option) => (
            <div
              key={option.key}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedOptions.includes(option.key)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => toggleOption(option.key)}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedOptions.includes(option.key)}
                  onChange={() => toggleOption(option.key)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">{option.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">
            The AI will consider employee availability, qualifications, and your
            selected optimization criteria to create the most efficient
            schedule.
          </p>
        </div>
      </div>
    </Modal>
  );
};