// components/ui/shift/BulkShiftCreator.tsx
import React, { useState } from 'react';
import { Modal, Button, Alert, DatePicker } from 'antd';
import {  FaSave } from 'react-icons/fa';
import { Dayjs } from 'dayjs';
import { BulkShiftCreationDto } from '@/lib/types/shift';

interface BulkShiftCreatorProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (template: BulkShiftCreationDto) => Promise<void>;
  loading: boolean;
  shifts: any[]; // Your shift type
  selectedWeek: [Dayjs, Dayjs];
}

export const BulkShiftCreator: React.FC<BulkShiftCreatorProps> = ({
  visible,
  onClose,
  onCreate,
  loading,
  shifts,
  selectedWeek,
}) => {
  const [templateName, setTemplateName] = useState('');
  const [scheduledWeek, setScheduledWeek] = useState<Dayjs>(selectedWeek[0]);
  const [error, setError] = useState<string>('');

  const handleCreate = async () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    if (shifts.length === 0) {
      setError('No shifts to save as template');
      return;
    }

    try {
      const template: BulkShiftCreationDto = {
        name: templateName,
        shifts: shifts.map(shift => ({
          client_id: shift.client_id,
          date: shift.date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          employee_ids: shift.employees.map((e: any) => e.employee.id),
          shift_type: shift.shift_type,
        })),
        scheduled_week: scheduledWeek.format('YYYY-MM-DD'),
      };

      await onCreate(template);
      setTemplateName('');
      setError('');
    } catch (err) {
      setError('Failed to create template');
    }
  };

  return (
    <Modal
      title="Create Bulk Shift Template"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<FaSave />}
          loading={loading}
          onClick={handleCreate}
        >
          Save Template
        </Button>,
      ]}
    >
      <div className="space-y-4">
        {error && <Alert message={error} type="error" />}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Name
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
            placeholder="e.g., Week 45 Schedule"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule For Week
          </label>
          <DatePicker
            value={scheduledWeek}
            onChange={(date) => date && setScheduledWeek(date)}
            picker="week"
            className="w-full"
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">
            This will save {shifts.length} shifts as a template for approval.
            Shifts will be created after approval.
          </p>
        </div>
      </div>
    </Modal>
  );
};