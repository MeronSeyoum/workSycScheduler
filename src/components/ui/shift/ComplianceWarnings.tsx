import React from "react";
import { Alert } from "antd";
import { FaExclamationTriangle } from "react-icons/fa";

interface ComplianceWarningsProps {
  warnings: string[];
  onClose: () => void;
}

export const ComplianceWarnings: React.FC<ComplianceWarningsProps> = ({
  warnings,
  onClose,
}) => {
  if (warnings.length === 0) return null;

  return (
    <Alert
      message={
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-500" />
          <span>Compliance Warnings</span>
        </div>
      }
      description={
        <div className="mt-2">
          {warnings.map((warning, index) => (
            <div key={index} className="text-sm text-yellow-700">
              • {warning}
            </div>
          ))}
        </div>
      }
      type="warning"
      showIcon={false}
      closable
      onClose={onClose}
      className="mb-6 rounded-lg border-yellow-200 bg-yellow-50"
    />
  );
};