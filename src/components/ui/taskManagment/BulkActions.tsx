'use client';

import { ShiftPhoto } from '@/lib/types/shiftPhoto';
import React from 'react';

interface BulkActionsProps {
  shiftId: string;
  pendingPhotos: ShiftPhoto[];
  approvalComments: Record<string, string>;
  loadingShiftId: string | null;
  onCommentChange: (shiftId: string, comment: string) => void;
  onApproveShift: (shiftId: string, status: 'approved' | 'rejected') => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  shiftId,
  pendingPhotos,
  approvalComments,
  loadingShiftId,
  onCommentChange,
  onApproveShift,
}) => {
  if (pendingPhotos.length === 0) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4">
        <p className="font-semibold text-green-900">✓ Review Completed</p>
        {pendingPhotos[0]?.manager_comment && (
          <p className="text-sm text-green-800 mt-2">{pendingPhotos[0].manager_comment}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl p-5 border-2 border-teal-200">
      <h5 className="font-bold text-gray-900 mb-3">Bulk Review Actions</h5>
      <textarea 
        placeholder="Add comment (required for rejection)..." 
        value={approvalComments[shiftId] || ''}
        onChange={(e) => onCommentChange(shiftId, e.target.value)}
        className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none mb-3"
        rows={2} 
        disabled={loadingShiftId === shiftId}
      />
      <p className="text-xs text-gray-600 mb-3">💡 Tip: Click individual photos for granular control</p>
      <div className="flex gap-3">
        <button 
          onClick={() => onApproveShift(shiftId, 'approved')} 
          disabled={loadingShiftId === shiftId}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:bg-gray-400"
        >
          {loadingShiftId === shiftId ? 'Processing...' : `✓ Approve All (${pendingPhotos.length})`}
        </button>
        <button 
          onClick={() => onApproveShift(shiftId, 'rejected')} 
          disabled={loadingShiftId === shiftId || !approvalComments[shiftId]?.trim()}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loadingShiftId === shiftId ? 'Processing...' : `✗ Reject All (${pendingPhotos.length})`}
        </button>
      </div>
    </div>
  );
};

export default BulkActions;