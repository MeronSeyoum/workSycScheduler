'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import ClientGroup from '@/components/ui/taskManagment/ClientGroup';
import ComplaintsTable from '@/components/ui/taskManagment/ComplaintsTable';
import ErrorDisplay from '@/components/ui/taskManagment/ErrorDisplay';
import { groupPhotosByShift } from '@/components/ui/taskManagment/helpers';
import LoadingSpinner from '@/components/ui/taskManagment/LoadingSpinner';
import PhotoPreviewModal from '@/components/ui/taskManagment/PhotoPreviewModal';
import StatsCards from '@/components/ui/taskManagment/StatsCards';
import { fetchPhotoComplaints, updateComplaintStatus } from '@/lib/api/photoComplaintService';
import { bulkUpdatePhotoApproval, fetchShiftPhotos, updatePhotoApproval } from '@/lib/api/shiftPhotoService';
import { Client } from '@/lib/types/client';
import { PhotoComplaint } from '@/lib/types/PhotoComplaint';
import { Shift } from '@/lib/types/shift';
import { ShiftPhoto } from '@/lib/types/shiftPhoto';
import React, { useState, useEffect } from 'react';

export default function PhotosAndComplaints() {
  const [photos, setPhotos] = useState<ShiftPhoto[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [complaints, setComplaints] = useState<PhotoComplaint[]>([]);
  const [approvalComments, setApprovalComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingShiftId, setLoadingShiftId] = useState<string | null>(null);
  const [loadingPhotoId, setLoadingPhotoId] = useState<string | null>(null);
  const [loadingComplaintId, setLoadingComplaintId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pending' | 'all'>('pending');
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<ShiftPhoto | null>(null);
  const [previewShiftPhotos, setPreviewShiftPhotos] = useState<ShiftPhoto[]>([]);

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const [photosData, complaintsData] = await Promise.all([
        fetchShiftPhotos(token, { includeComplaints: true }),
        fetchPhotoComplaints(token, { status: 'filed' })
      ]);

      setPhotos(photosData);
      console.log(photos)
      setComplaints(complaintsData);

      const uniqueShifts = Array.from(
        new Map(photosData.map(photo => [photo.shift.id, photo.shift])).values()
      );
      setShifts(uniqueShifts);

      const uniqueClients = Array.from(
        new Map(uniqueShifts.map(shift => [shift.client.id, shift.client])).values()
      );
      setClients(uniqueClients);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data from server');
    } finally {
      setLoading(false);
    }
  };

  const openPhotoPreview = (photo: ShiftPhoto, shiftPhotos: ShiftPhoto[]) => {
    setSelectedPhoto(photo);
    setPreviewShiftPhotos(shiftPhotos);
  };

  const closePhotoPreview = () => {
    setSelectedPhoto(null);
    setPreviewShiftPhotos([]);
  };

  const navigateToPhoto = (photoId: string) => {
    const photo = previewShiftPhotos.find((p) => p.id === photoId);
    if (photo) setSelectedPhoto(photo);
  };

  const approvePhoto = async (photoId: string, status: 'approved' | 'rejected', comment: string) => {
    if (!token) return;
    
    if (status === 'rejected' && !comment.trim()) {
      setError('Comment required for rejection');
      return;
    }

    setLoadingPhotoId(photoId);
    setError(null);

    try {
      const updatedPhoto = await updatePhotoApproval(
        token,
        photoId, 
        { 
          manager_approval_status: status, 
          manager_comment: comment || undefined
        }
      );

      setPhotos((prev) => prev.map((photo) =>
        photo.id === photoId ? updatedPhoto : photo
      ));
      
      setPreviewShiftPhotos((prev) => prev.map((photo) =>
        photo.id === photoId ? updatedPhoto : photo
      ));
      
      setSelectedPhoto((prev) => prev && prev.id === photoId ? updatedPhoto : prev);

    } catch (error) {
      console.error('Error approving photo:', error);
      setError('Failed to approve photo');
    } finally {
      setLoadingPhotoId(null);
    }
  };

  const approveShift = async (shiftId: string, status: 'approved' | 'rejected') => {
    if (!token) return;
    
    const comment = approvalComments[shiftId] || '';
    if (status === 'rejected' && !comment.trim()) {
      setError('Comment required for rejection');
      return;
    }

    setLoadingShiftId(shiftId);
    setError(null);

    try {
      const shiftPendingPhotos = photos.filter(
        photo => photo.shift_id.toString() === shiftId && photo.manager_approval_status === 'pending'
      );

      if (shiftPendingPhotos.length === 0) {
        setError('No pending photos found for this shift');
        setLoadingShiftId(null);
        return;
      }

      const photoIds = shiftPendingPhotos.map(photo => photo.id);
      await bulkUpdatePhotoApproval(
        token,
        {
          photo_ids: photoIds,
          manager_approval_status: status,
          manager_comment: comment
        }
      );

      const updatedPhotos = await fetchShiftPhotos(token, { includeComplaints: true });
      setPhotos(updatedPhotos);
      
      setApprovalComments((prev) => {
        const updated = { ...prev };
        delete updated[shiftId];
        return updated;
      });

    } catch (error) {
      console.error('Error approving shift:', error);
      setError('Failed to approve shift');
    } finally {
      setLoadingShiftId(null);
    }
  };

  const resolveComplaint = async (complaintId: string, newStatus: 'filed' | 'under_review' | 'resolved' | 'dismissed') => {
    if (!token) return;
    
    setLoadingComplaintId(complaintId);
    setError(null);

    try {
      const resolutionNote = newStatus === 'resolved' ? 'Issue resolved by manager' : 
                           newStatus === 'dismissed' ? 'Complaint dismissed by manager' : undefined;

      const updatedComplaint = await updateComplaintStatus(
        token,
        complaintId, 
        { 
          status: newStatus, 
          resolution_note: resolutionNote 
        }
      );

      setComplaints((prev) => prev.map((complaint) =>
        complaint.id === complaintId ? updatedComplaint : complaint
      ));

    } catch (error) {
      console.error('Error resolving complaint:', error);
      setError('Failed to resolve complaint');
    } finally {
      setLoadingComplaintId(null);
    }
  };

  const toggleClientExpansion = (clientId: string) => {
    setExpandedClients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const handleCommentChange = (shiftId: string, comment: string) => {
    setApprovalComments((prev) => ({ ...prev, [shiftId]: comment }));
  };

  const refreshData = async () => {
    await fetchData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredPhotos = viewMode === 'pending' 
    ? photos.filter((p) => p.manager_approval_status === 'pending') 
    : photos;

  const groupedPhotos = groupPhotosByShift(filteredPhotos);
  
  const clientGroups: Record<string, { client: Client; shifts: Shift[]; photos: ShiftPhoto[] }> = {};
  
  shifts.forEach((shift) => {
    const shiftId = shift.id.toString();
    const shiftPhotos = groupedPhotos[shiftId] || [];
    
    if (viewMode === 'all' || shiftPhotos.length > 0) {
      const clientId = shift.client_id.toString();
      
      if (!clientGroups[clientId]) {
        const client = clients.find(c => c.id === shift.client_id);
        if (client) {
          clientGroups[clientId] = { client, shifts: [], photos: [] };
        }
      }
      
      if (clientGroups[clientId]) {
        clientGroups[clientId].shifts.push(shift);
        clientGroups[clientId].photos.push(...shiftPhotos);
      }
    }
  });

  const filedComplaints = complaints.filter((c) => c.status === 'filed');

  return (
    <div className="min-h-screen">
      <PhotoPreviewModal 
        photo={selectedPhoto} 
        allShiftPhotos={previewShiftPhotos} 
        onClose={closePhotoPreview} 
        onNavigate={navigateToPhoto} 
        onApprove={approvePhoto} 
        loadingPhotoId={loadingPhotoId}
      />

      <div className="mx-auto px-6">
        <ErrorDisplay error={error} onDismiss={() => setError(null)} />

        <div className="flex justify-end mb-4">
          <button
            onClick={refreshData}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Refresh Data
          </button>
        </div>

        <StatsCards 
          pendingShifts={Object.keys(groupPhotosByShift(photos.filter((p) => p.manager_approval_status === 'pending'))).length}
          activeComplaints={filedComplaints.length}
          totalPhotos={photos.length}
          activeClients={Object.keys(clientGroups).length}
        />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-teal-700">Shift Submissions</h2>
          <div className="bg-white rounded-xl p-1.5 shadow-md border border-gray-200 inline-flex">
            <button 
              onClick={() => setViewMode('pending')}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                viewMode === 'pending' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending
            </button>
            <button 
              onClick={() => setViewMode('all')}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                viewMode === 'all' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Shifts
            </button>
          </div>
        </div>

        {Object.keys(clientGroups).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {viewMode === 'pending' ? 'No pending shifts to review' : 'No shifts found'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(clientGroups).map(({ client, shifts: clientShifts, photos: clientPhotos }) => (
              <ClientGroup
                key={client.id}
                client={client}
                shifts={clientShifts}
                photos={clientPhotos}
                groupedPhotos={groupedPhotos}
                isExpanded={expandedClients.has(client.id.toString())}
                approvalComments={approvalComments}
                loadingShiftId={loadingShiftId}
                onToggleExpansion={() => toggleClientExpansion(client.id.toString())}
                onPhotoClick={openPhotoPreview}
                onCommentChange={handleCommentChange}
                onApproveShift={approveShift}
              />
            ))}
          </div>
        )}

        <ComplaintsTable
          complaints={filedComplaints}
          photos={photos}
          loadingComplaintId={loadingComplaintId}
          onComplaintStatusChange={resolveComplaint}
          onPhotoClick={openPhotoPreview}
        />
      </div>
    </div>
  );
}