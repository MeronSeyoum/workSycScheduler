'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, User, Clock4, AlertCircle } from 'lucide-react';
import  Button  from '@/components/ui/common/Button';
import  Input  from '@/components/ui/common/Input';
import  Label  from '@/components/ui/common/label';
import { toast } from '@/components/ui/common/use-toast';
import { submitManualEntry } from '@/lib/timeLogs';
import { Employee } from '@/lib/types/employee';
import * as z from 'zod';

// Form validation schema
const formSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  clockIn: z.string().min(1, 'Clock-in time is required'),
  clockOut: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

type FormValues = z.infer<typeof formSchema>;

interface ManualEntryModalProps {
  employees: Employee[];
  onSuccess?: () => void;
 locations: Location[]; 
}

export function ManualEntryModal({ employees, onSuccess }: ManualEntryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      clockIn: new Date().toISOString().slice(0, 16),
      clockOut: '',
      notes: ''
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitManualEntry({
        employeeId: data.employeeId,
        clockIn: new Date(data.clockIn).toISOString(),
        clockOut: data.clockOut ? new Date(data.clockOut).toISOString() : null,
        notes: data.notes || null
      });

      if (result?.error) {
        setError(result.error);
      } else {
        toast({
          title: 'Success',
          description: 'Time entry added successfully',
          variant: 'default',
        });
        reset();
        setIsOpen(false);
        onSuccess?.();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-1 flex items-center">
        <Clock4 className="h-4 w-4" />
        <span>Manual Entry</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Manual Time Entry</h2>
              <button 
                onClick={() => {
                  reset();
                  setIsOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="employeeId" className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  Employee
                </Label>
                <select
                  id="employeeId"
                  {...register('employeeId')}
                  className="w-full p-2 border rounded-md"
                  disabled={isSubmitting}
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
                {errors.employeeId && (
                  <p className="text-red-500 text-sm mt-1">{errors.employeeId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clockIn" className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Clock In
                  </Label>
                  <Input
                    id="clockIn"
                    type="datetime-local"
                    {...register('clockIn')}
                    disabled={isSubmitting}
                  />
                  {errors.clockIn && (
                    <p className="text-red-500 text-sm mt-1">{errors.clockIn.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="clockOut" className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Clock Out
                  </Label>
                  <Input
                    id="clockOut"
                    type="datetime-local"
                    {...register('clockOut')}
                    disabled={isSubmitting}
                  />
                  {errors.clockOut && (
                    <p className="text-red-500 text-sm mt-1">{errors.clockOut.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="block mb-2">
                  Notes (Optional)
                </Label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  disabled={isSubmitting}
                />
                {errors.notes && (
                  <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setIsOpen(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}