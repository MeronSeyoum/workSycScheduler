'use client';

import React from 'react';
import Image from 'next/image';
import { getStatusColor } from './helpers';
import { ShiftPhoto } from '@/lib/types/shiftPhoto';
import { PhotoComplaint } from '@/lib/types/PhotoComplaint';

interface ComplaintsTableProps {
  complaints: PhotoComplaint[];
  photos: ShiftPhoto[];
  loadingComplaintId: string | null;
  onComplaintStatusChange: (complaintId: string, newStatus: 'filed' | 'under_review' | 'resolved' | 'dismissed') => void;
  onPhotoClick: (photo: ShiftPhoto, shiftPhotos: ShiftPhoto[]) => void;
}

const ComplaintsTable: React.FC<ComplaintsTableProps> = ({
  complaints,
  photos,
  loadingComplaintId,
  onComplaintStatusChange,
  onPhotoClick,
}) => {
  if (complaints.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-teal-700 mb-6">Active Complaints</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Photo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Client</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Issue</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        const shiftPhotos = photos.filter(p => p.shift_id === complaint.ShiftPhoto.shift_id);
                        onPhotoClick(complaint.ShiftPhoto, shiftPhotos);
                      }} 
                      className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-teal-500 transition-all"
                    >
                      <Image 
                        src={complaint.ShiftPhoto.photo_url} 
                        alt="Complaint" 
                        fill 
                        className="object-cover" 
                        sizes="64px" 
                        unoptimized 
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {/* ✅ Access employee name directly - your types have first_name/last_name on Employee */}
                    <p className=" text-gray-900">
                      {complaint.ShiftPhoto.employee.user?.first_name} {complaint.ShiftPhoto.employee.user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{complaint.ShiftPhoto.employee.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    {/* ✅ Use business_name and contact_person from your Client type */}
                    <p className="font-semibold text-gray-900">{complaint.client.business_name}</p>
                    <p className="text-xs text-gray-500">{complaint.client.contact_person}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(complaint.reason)}`}>
                      {complaint.reason.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-gray-700 line-clamp-2">{complaint.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={complaint.status}
                      onChange={(e) => onComplaintStatusChange(
                        complaint.id, 
                        e.target.value as 'filed' | 'under_review' | 'resolved' | 'dismissed'
                      )}
                      disabled={loadingComplaintId === complaint.id}
                      className="text-sm border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-semibold"
                    >
                      <option value="filed">Filed</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsTable;