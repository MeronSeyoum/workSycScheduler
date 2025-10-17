'use client';

import React from 'react';
import ShiftSection from './ShiftSection';
import { Client } from '@/lib/types/client';
import { Shift } from '@/lib/types/shift';
import { ShiftPhoto } from '@/lib/types/shiftPhoto';

interface ClientGroupProps {
  client: Client;
  shifts: Shift[];
  photos: ShiftPhoto[];
  groupedPhotos: Record<string, ShiftPhoto[]>;
  isExpanded: boolean;
  approvalComments: Record<string, string>;
  loadingShiftId: string | null;
  onToggleExpansion: (clientId: string) => void;
  onPhotoClick: (photo: ShiftPhoto, shiftPhotos: ShiftPhoto[]) => void;
  onCommentChange: (shiftId: string, comment: string) => void;
  onApproveShift: (shiftId: string, status: 'approved' | 'rejected') => void;
}

const ClientGroup: React.FC<ClientGroupProps> = ({
  client,
  shifts,
  photos,
  groupedPhotos,
  isExpanded,
  approvalComments,
  loadingShiftId,
  onToggleExpansion,
  onPhotoClick,
  onCommentChange,
  onApproveShift,
}) => {
  const pendingCount = photos.filter(p => p.manager_approval_status === 'pending').length;
console.log(photos)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Client Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-gray-400 text-white rounded-xl p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              {/* ✅ FIXED: Use business_name instead of name */}
              <h3 className="text-base font-bold text-gray-700">{client.business_name}</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {/* ✅ FIXED: Use contact_person instead of managerName */}
                {client.contact_person} • {shifts.length} shift{shifts.length !== 1 ? 's' : ''} • {photos.length} photo{photos.length !== 1 ? 's' : ''}
                {pendingCount > 0 && <span className="text-yellow-600 font-semibold ml-2">• {pendingCount} pending</span>}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onToggleExpansion(client.id.toString())}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white rounded-lg transition-colors border border-gray-300"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Shifts */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {shifts.map((shift) => {
            // ✅ FIXED: Convert shift.id to string for lookup
            const shiftPhotos = groupedPhotos[shift.id.toString()] || [];
            if (shiftPhotos.length === 0) return null;

            return (
              <ShiftSection
                key={shift.id}
                shift={shift}
                shiftPhotos={shiftPhotos}
                approvalComments={approvalComments}
                loadingShiftId={loadingShiftId}
                onPhotoClick={onPhotoClick}
                onCommentChange={onCommentChange}
                onApproveShift={onApproveShift}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientGroup;