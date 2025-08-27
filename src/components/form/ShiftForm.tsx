'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/common/Button';

interface ShiftFormProps {
  shift?: {
    id: string;
    employeeId: string;
    startTime: string;
    endTime: string;
    date: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  } | null; 
  onSave: (data: Omit<ShiftFormData, 'id'>) => void;
  onCancel: () => void;
}


type ShiftFormData = {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
};

const employeeOptions = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  // Add more employees or fetch dynamically
];

export default function ShiftForm({ shift, onSave, onCancel }: ShiftFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ShiftFormData>({
    defaultValues: {
      employeeId: shift?.employeeId || '',
      date: shift?.date || '',
      startTime: shift?.startTime || '',
      endTime: shift?.endTime || '',
      status: shift?.status || 'scheduled',
    },
  });

  useEffect(() => {
    // Reset form if shift changes (e.g., open new shift to edit)
    reset({
      employeeId: shift?.employeeId || '',
      date: shift?.date || '',
      startTime: shift?.startTime || '',
      endTime: shift?.endTime || '',
      status: shift?.status || 'scheduled',
    });
  }, [shift, reset]);

  // Basic validation: End time after start time
  const startTime = watch('startTime');
  const endTime = watch('endTime');

  const onSubmit = (data: ShiftFormData) => {
    if (startTime >= endTime) {
      alert('End time must be after start time');
      return;
    }
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="employeeId" className="block font-medium text-gray-700 mb-1">
          Employee
        </label>
        <select
          id="employeeId"
          {...register('employeeId', { required: 'Please select an employee' })}
          className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.employeeId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select an employee</option>
          {employeeOptions.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
        {errors.employeeId && <p className="text-red-600 text-sm mt-1">{errors.employeeId.message}</p>}
      </div>

      <div>
        <label htmlFor="date" className="block font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          {...register('date', { required: 'Please select a date' })}
          className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.date ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            {...register('startTime', { required: 'Please enter start time' })}
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.startTime ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startTime && <p className="text-red-600 text-sm mt-1">{errors.startTime.message}</p>}
        </div>

        <div>
          <label htmlFor="endTime" className="block font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="time"
            id="endTime"
            {...register('endTime', { required: 'Please enter end time' })}
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.endTime ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.endTime && <p className="text-red-600 text-sm mt-1">{errors.endTime.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          {...register('status', { required: 'Please select a status' })}
          className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.status ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>}
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
