// components/ui/shift/BulkShiftApproval.tsx
import React from 'react';
import { Modal, Button, Alert, Badge } from 'antd';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { BulkShiftTemplate } from '@/lib/types/shift';

interface BulkShiftApprovalProps {
  visible: boolean;
  onClose: () => void;
  templates: BulkShiftTemplate[];
  onApprove: (templateId: number) => Promise<void>;
  onReject: (templateId: number, reason: string) => Promise<void>;
  loading: boolean;
}

export const BulkShiftApproval: React.FC<BulkShiftApprovalProps> = ({
  visible,
  onClose,
  templates,
  onApprove,
  onReject,
  loading,
}) => {

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'blue', text: 'Draft' },
      pending_approval: { color: 'orange', text: 'Pending Approval' },
      approved: { color: 'green', text: 'Approved' },
      rejected: { color: 'red', text: 'Rejected' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge color={config.color} text={config.text} />;
  };

  return (
    <Modal
      title="Bulk Shift Approval"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <div className="space-y-4">
        {templates.length === 0 ? (
          <Alert message="No templates pending approval" type="info" />
        ) : (
          templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">{template.name}</h4>
                  <p className="text-sm text-gray-600">
                    {template.shifts.length} shifts • Week of {template.scheduled_week}
                  </p>
                </div>
                {getStatusBadge(template.status)}
              </div>

              {template.status === 'pending_approval' && (
                <div className="flex gap-2">
                  <Button
                    icon={<FaCheck />}
                    onClick={() => onApprove(template.id)}
                    loading={loading}
                    className="bg-green-500 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    icon={<FaTimes />}
                    onClick={() => {
                      const reason = prompt('Reason for rejection:');
                      if (reason) onReject(template.id, reason);
                    }}
                    loading={loading}
                    danger
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};