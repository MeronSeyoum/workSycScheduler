'use client';

import React from 'react';
import EmployeePhotos from './EmployeePhotos';
import BulkActions from './BulkActions';
import { groupPhotosByEmployee, getShiftEmployees, getShiftStatus, getStatusColor } from './helpers';
import { Shift } from '@/lib/types/shift';
import { ShiftPhoto } from '@/lib/types/shiftPhoto';
import { Employee } from '@/lib/types/employee';

interface ShiftSectionProps {
  shift: Shift;
  shiftPhotos: ShiftPhoto[];
  approvalComments: Record<string, string>;
  loadingShiftId: string | null;
  onPhotoClick: (photo: ShiftPhoto, shiftPhotos: ShiftPhoto[]) => void;
  onCommentChange: (shiftId: string, comment: string) => void;
  onApproveShift: (shiftId: string, status: 'approved' | 'rejected') => void;
}

const ShiftSection: React.FC<ShiftSectionProps> = ({
  shift,
  shiftPhotos,
  approvalComments,
  loadingShiftId,
  onPhotoClick,
  onCommentChange,
  onApproveShift,
}) => {
  const shiftStatus = getShiftStatus(shiftPhotos);
  const pendingPhotos = shiftPhotos.filter(p => p.manager_approval_status === 'pending');
  const shiftEmployees = getShiftEmployees(shiftPhotos);
  const employeeGroups = groupPhotosByEmployee(shiftPhotos);

  // ✅ Convert shift.id to string and get last 4 characters
  const shiftIdDisplay = shift.id.toString().slice(-4);

  // ✅ Get location from shift or client
  const location = shift.client?.business_name || 'Location not specified';

  // ✅ Format date properly
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ Format time properly (remove seconds if present)
  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    
    // Handle both "HH:MM:SS" and "HH:MM" formats
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      const hours = Number.parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      
      return `${displayHours}:${minutes} ${period}`;
    }
    
    return timeString;
  };

  // ✅ Get employee display name safely
  const getEmployeeDisplayName = (employee: Employee) => {
    if (!employee) return 'Unknown Employee';
    
    // Check if employee has user object with name fields
    if (employee.user) {
      const firstName = employee.user.first_name || '';
      const lastName = employee.user.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Unknown Employee';
    }
    
    // Check if employee has direct name fields
    if (employee.first_name || employee.last_name) {
      const firstName = employee.first_name || '';
      const lastName = employee.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Unknown Employee';
    }
    
    // Fallback to employee code or ID
    return employee.employee_code || `Employee ${employee.id}`;
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Shift Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h4 className="font-bold text-gray-900">Shift #{shiftIdDisplay}</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(shiftStatus)}`}>
                {shiftStatus.toUpperCase()}
              </span>
              {shiftEmployees.length > 1 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                  TEAM ({shiftEmployees.length})
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {/* ✅ Fixed date and time formatting */}
                {formatDate(shift.date)} • {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {/* ✅ Fixed employee name display */}
                {shiftEmployees.map(employee => getEmployeeDisplayName(employee)).join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Photos */}
      <div className="p-5 space-y-5">
        {shiftEmployees.map((employee) => {
          const employeePhotos = employeeGroups[employee.id] || [];
          
          return (
            <EmployeePhotos
              key={employee.id}
              employee={employee}
              employeePhotos={employeePhotos}
              shiftPhotos={shiftPhotos}
              onPhotoClick={onPhotoClick}
            />
          );
        })}

        {/* Bulk Actions */}
        <BulkActions
          shiftId={shift.id.toString()}
          pendingPhotos={pendingPhotos}
          approvalComments={approvalComments}
          loadingShiftId={loadingShiftId}
          onCommentChange={onCommentChange}
          onApproveShift={onApproveShift}
        />
      </div>
    </div>
  );
};

export default ShiftSection;