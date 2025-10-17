import { Employee } from "@/lib/types/employee";
import { ShiftPhoto } from "@/lib/types/shiftPhoto";

export const groupPhotosByShift = (photos: ShiftPhoto[]): Record<string, ShiftPhoto[]> => {
  return photos.reduce((acc, photo) => {
    const shiftId = photo.shift_id.toString();
    if (!acc[shiftId]) acc[shiftId] = [];
    acc[shiftId].push(photo);
    return acc;
  }, {} as Record<string, ShiftPhoto[]>);
};

export const groupPhotosByEmployee = (photos: ShiftPhoto[]): Record<string, ShiftPhoto[]> => {
  return photos.reduce((acc, photo) => {
    const employeeId = photo.employee_id.toString();
    if (!acc[employeeId]) acc[employeeId] = [];
    acc[employeeId].push(photo);
    return acc;
  }, {} as Record<string, ShiftPhoto[]>);
};

export const getShiftEmployees = (photos: ShiftPhoto[]): Employee[] => {
  const employeeMap = new Map<string, Employee>();
  photos.forEach((photo) => {
    const employeeId = photo.employee_id.toString();
    if (!employeeMap.has(employeeId)) {
      employeeMap.set(employeeId, photo.employee);
    }
  });
  return Array.from(employeeMap.values());
};

export const getShiftStatus = (photos: ShiftPhoto[]): 'pending' | 'approved' | 'rejected' | 'mixed' => {
  const statuses = photos.map((p) => p.manager_approval_status);
  if (statuses.every((s) => s === 'approved')) return 'approved';
  if (statuses.every((s) => s === 'rejected')) return 'rejected';
  if (statuses.every((s) => s === 'pending')) return 'pending';
  return 'mixed';
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
        // Photo approval statuses
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    mixed: 'bg-orange-100 text-orange-700 border-orange-200',
    
    // Complaint statuses
    filed: 'bg-red-100 text-red-700 border-red-200',
    under_review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    resolved: 'bg-green-100 text-green-700 border-green-200',
    dismissed: 'bg-gray-100 text-gray-700 border-gray-200',

    // Complaint issue
      poor_quality: 'bg-purple-100 text-red-700 border-purple-200',
    task_incomplete: 'bg-orange-100 text-orange-700 border-orange-200',
    wrong_location: 'bg-blue-100 text-red-700 border-blue-200',
    safety_concern: 'bg-red-100 text-red-700 border-red-200',
    other: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

// Helper to get task name (either from task or custom)
export const getTaskName = (photo: ShiftPhoto): string => {
  return photo.task?.name || photo.custom_task_name || 'Unnamed Task';
};