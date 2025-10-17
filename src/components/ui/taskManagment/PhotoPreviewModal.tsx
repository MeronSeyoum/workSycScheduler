'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getTaskName } from './helpers';
import { ShiftPhoto } from '@/lib/types/shiftPhoto';

interface PhotoPreviewProps {
  photo: ShiftPhoto | null;
  allShiftPhotos: ShiftPhoto[];
  onClose: () => void;
  onNavigate: (photoId: string) => void;
  onApprove?: (photoId: string, status: 'approved' | 'rejected', comment: string) => void;
  loadingPhotoId?: string | null;
}

const PhotoPreviewModal: React.FC<PhotoPreviewProps> = ({
  photo,
  allShiftPhotos,
  onClose,
  onNavigate,
  onApprove,
  loadingPhotoId,
}) => {
  const [comment, setComment] = useState('');

  if (!photo) return null;

  const currentIndex = allShiftPhotos.findIndex((p) => p.id === photo.id);
  const hasNext = currentIndex < allShiftPhotos.length - 1;
  const hasPrev = currentIndex > 0;
  const isPending = photo.manager_approval_status === 'pending';
  const isLoading = loadingPhotoId === photo.id;

  const handleNext = () => {
    if (hasNext) {
      setComment('');
      onNavigate(allShiftPhotos[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      setComment('');
      onNavigate(allShiftPhotos[currentIndex - 1].id);
    }
  };

  const handleApprove = (status: 'approved' | 'rejected') => {
    if (onApprove) {
      onApprove(photo.id, status, comment);
      setComment('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="text-lg font-semibold">Photo {currentIndex + 1} of {allShiftPhotos.length}</h3>
            {/* ✅ Access employee name directly - your types have first_name/last_name on Employee */}
            <p className="text-sm text-teal-100 mt-0.5">
              {photo.employee.first_name} {photo.employee.last_name} • {getTaskName(photo)}
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(92vh-80px)]">
          {/* Image Display */}
          <div className="relative bg-gray-900">
            <div className="relative w-full aspect-video">
              <Image 
                src={photo.photo_url} 
                alt={`Photo ${currentIndex + 1}`} 
                fill 
                className="object-contain" 
                sizes="(max-width: 1280px) 100vw, 1280px" 
                unoptimized 
              />
            </div>

            {/* Navigation */}
            {hasPrev && (
              <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-xl transition-all hover:scale-110">
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {hasNext && (
              <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-xl transition-all hover:scale-110">
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                photo.manager_approval_status === 'approved' ? 'bg-green-500' :
                photo.manager_approval_status === 'rejected' ? 'bg-red-500' : 'bg-yellow-400'
              } text-white shadow-lg`}>
                {photo.manager_approval_status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Description</h4>
              <p className="text-gray-800">{photo.description || 'No description provided'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Submitted</h4>
                <p className="text-gray-800 text-sm">{new Date(photo.uploaded_at).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Employee</h4>
                {/* ✅ Access employee name directly */}
                <p className="text-gray-800 text-sm">
                  {photo.employee?.user?.first_name} {photo.employee.user?.last_name} 
                </p>
              </div>
            </div>

            {photo.manager_comment && (
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-amber-800 uppercase mb-2">Manager Feedback</h4>
                <p className="text-amber-900">{photo.manager_comment}</p>
              </div>
            )}

            {/* Quick Review */}
            {isPending && onApprove && (
              <div className="bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl p-5 border border-teal-100">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Review</h4>
                <textarea
                  placeholder="Add feedback (required for rejection)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none mb-3"
                  rows={2}
                  disabled={isLoading}
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleApprove('approved')} 
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : '✓ Approve'}
                  </button>
                  <button 
                    onClick={() => handleApprove('rejected')} 
                    disabled={!comment.trim() || isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : '✗ Reject'}
                  </button>
                </div>
              </div>
            )}

            {/* Thumbnails */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">All Photos in Shift</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allShiftPhotos.map((p, idx) => (
                  <button 
                    key={p.id} 
                    onClick={() => { setComment(''); onNavigate(p.id); }}
                    className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                      p.id === photo.id ? 'ring-4 ring-teal-500 scale-105' : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <div className="relative w-20 h-20 bg-gray-100">
                      <Image 
                        src={p.photo_url} 
                        alt={`Thumb ${idx + 1}`} 
                        fill 
                        className="object-cover" 
                        sizes="80px" 
                        unoptimized 
                      />
                      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full ${
                        p.manager_approval_status === 'approved' ? 'bg-green-500' :
                        p.manager_approval_status === 'rejected' ? 'bg-red-500' : 'bg-yellow-400 border border-yellow-600'
                      }`} />
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        {idx + 1}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoPreviewModal;