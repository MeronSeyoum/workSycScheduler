'use client';

import React from 'react';
import Image from 'next/image';
import { getTaskName } from './helpers';
import { Employee } from '@/lib/types/employee';
import { ShiftPhoto } from '@/lib/types/shiftPhoto';

interface EmployeePhotosProps {
  employee: Employee;
  employeePhotos: ShiftPhoto[];
  shiftPhotos: ShiftPhoto[];
  onPhotoClick: (photo: ShiftPhoto, shiftPhotos: ShiftPhoto[]) => void;
}

const EmployeePhotos: React.FC<EmployeePhotosProps> = ({
  employee,
  employeePhotos,
  shiftPhotos,
  onPhotoClick,
}) => {
  const employeePending = employeePhotos.filter(p => p.manager_approval_status === 'pending').length;

  // ✅ Get employee display name safely
  const getEmployeeDisplayName = () => {
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

  // ✅ Handle broken images
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/api/placeholder/200/200'; // Fallback placeholder
    target.alt = 'Photo not available';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            {/* ✅ Use safe employee name display */}
            <p className="font-semibold text-gray-900">
              {getEmployeeDisplayName()}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {employeePhotos.length} photo{employeePhotos.length !== 1 ? 's' : ''}
              {employeePending > 0 && (
                <span className="text-yellow-600 font-semibold ml-1">• {employeePending} pending</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {employeePhotos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No photos submitted</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {employeePhotos.map((photo) => (
              <button 
                key={photo.id} 
                onClick={() => onPhotoClick(photo, shiftPhotos)}
                className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden hover:ring-4 hover:ring-teal-400 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-400"
              >
                {/* ✅ Fixed Image component with error handling */}
                <div className="relative w-full h-full">
                  <Image 
                    src={photo.photo_url} 
                    alt={`Photo by ${getEmployeeDisplayName()}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform" 
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    onError={handleImageError}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    photo.manager_approval_status === 'approved' ? 'bg-green-500 text-white' :
                    photo.manager_approval_status === 'rejected' ? 'bg-red-500 text-white' : 
                    'bg-yellow-400 text-gray-800'
                  } shadow-lg`}>
                    {photo.manager_approval_status === 'approved' ? '✓' : 
                     photo.manager_approval_status === 'rejected' ? '✗' : '⏱'}
                  </span>
                </div>
                
                {/* Task Name Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-xs font-semibold truncate">
                    {getTaskName(photo)}
                  </p>
                  <p className="text-white/80 text-xs truncate">
                    {new Date(photo.uploaded_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePhotos;