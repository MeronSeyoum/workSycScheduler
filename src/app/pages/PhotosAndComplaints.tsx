'use client';

import React, { useState, useEffect, type JSX } from 'react';
import Image from 'next/image';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ShiftPhoto {
  id: string;
  shiftId: string;
  employeeId: string;
  photoUrl: string;
  publicId: string;
  description?: string;
  uploadedAt: string;
  managerApprovalStatus: 'pending' | 'approved' | 'rejected';
  managerApprovedAt?: string;
  managerComment?: string;
  employee: Employee;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Complaint {
  id: string;
  photoId: string;
  clientId: string;
  reason: 'poor_quality' | 'task_incomplete' | 'wrong_location' | 'safety_concern' | 'other';
  description: string;
  status: 'filed' | 'under_review' | 'resolved' | 'dismissed';
  resolvedAt?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
  ShiftPhoto: ShiftPhoto;
  client: Client;
}

// Import local images
import photo1 from '../../assets/images/photo-1.png';
import photo2 from '../../assets/images/photo-2.png';
import photo3 from '../../assets/images/photo-3.png';
import photo4 from '../../assets/images/photo-4.png';
import photo5 from '../../assets/images/photo-5.png';
import photo6 from '../../assets/images/photo-6.png';
import photo7 from '../../assets/images/photo-7.png';
import photo8 from '../../assets/images/photo-8.png';
import photo9 from '../../assets/images/photo-9.png';
import photo10 from '../../assets/images/photo-10.png';
import photo11 from '../../assets/images/photo-11.png';
import photo12 from '../../assets/images/photo-12.png';

const allLocalPhotos = [photo1, photo2, photo3, photo4, photo5, photo6, photo7, photo8, photo9, photo10, photo11, photo12];

// Get dummy image URL from local imports
const getDummyImageUrl = (index: number): string => {
  return allLocalPhotos[index % allLocalPhotos.length].src;
};

// Get image data from local imports
const getDummyImage = (index: number) => {
  return allLocalPhotos[index % allLocalPhotos.length];
};

// Generate dummy data
const generateDummyPhotos = (): ShiftPhoto[] => {
  const employees: Employee[] = [
    { id: '1', firstName: 'John', lastName: 'Smith', email: 'john.smith@cleaning.com' },
    { id: '2', firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@cleaning.com' },
    { id: '3', firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.hassan@cleaning.com' },
  ];

  const photoDescriptions = [
    'Main entrance - floors mopped and glass doors cleaned',
    'Reception area - desks dusted and chairs organized',
    'Conference room A - table polished and whiteboard cleaned',
    'Conference room B - chairs arranged and floor vacuumed',
    'Kitchen area - counters sanitized and appliances wiped',
    'Break room - microwave cleaned and refrigerator organized',
    'Bathroom A - mirrors polished and fixtures sanitized',
    'Bathroom B - floors mopped and supplies restocked',
    'Executive office - detailed dusting and vacuuming',
    'Printing station - organized papers and cleaned surfaces',
    'Storage room - supplies organized and shelves dusted',
    'Hallway - floors buffed and walls spot cleaned',
    'Waiting area - furniture arranged and magazines organized',
    'Coffee station - machine cleaned and supplies restocked',
    'Phone booths - glass partitions cleaned and surfaces sanitized',
    'Staircase - handrails polished and steps vacuumed'
  ];

  const photos: ShiftPhoto[] = [];
  let photoIndex = 0;

  // Shift 1 - John Smith (8 images)
  for (let i = 0; i < 8; i++) {
    photos.push({
      id: `photo-1-${i + 1}`,
      shiftId: 'shift-1',
      employeeId: '1',
      photoUrl: getDummyImageUrl(photoIndex),
      publicId: `shifts/shift-1/photo-${i + 1}`,
      description: photoDescriptions[photoIndex % photoDescriptions.length],
      uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      managerApprovalStatus: 'pending',
      employee: employees[0],
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    });
    photoIndex++;
  }

  // Shift 2 - Maria Garcia (12 images - approved)
  for (let i = 0; i < 12; i++) {
    photos.push({
      id: `photo-2-${i + 1}`,
      shiftId: 'shift-2',
      employeeId: '2',
      photoUrl: getDummyImageUrl(photoIndex),
      publicId: `shifts/shift-2/photo-${i + 1}`,
      description: photoDescriptions[photoIndex % photoDescriptions.length],
      uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      managerApprovalStatus: 'approved',
      managerApprovedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      managerComment: 'Excellent comprehensive cleaning! All areas meet our quality standards.',
      employee: employees[1],
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    });
    photoIndex++;
  }

  // Shift 3 - Ahmed Hassan (6 images - mixed status)
  for (let i = 0; i < 6; i++) {
    const status: 'pending' | 'approved' | 'rejected' = 
      i < 2 ? 'approved' : i < 4 ? 'rejected' : 'pending';
    
    photos.push({
      id: `photo-3-${i + 1}`,
      shiftId: 'shift-3',
      employeeId: '3',
      photoUrl: getDummyImageUrl(photoIndex),
      publicId: `shifts/shift-3/photo-${i + 1}`,
      description: photoDescriptions[photoIndex % photoDescriptions.length],
      uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      managerApprovalStatus: status,
      managerApprovedAt: i < 4 ? new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() : undefined,
      managerComment: i < 4 ? 'Good work on most areas, but need improvement in storage rooms and high surfaces.' : undefined,
      employee: employees[2],
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: i < 4 ? new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() : new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    });
    photoIndex++;
  }

  // Shift 4 - John Smith (4 images - pending)
  for (let i = 0; i < 4; i++) {
    photos.push({
      id: `photo-4-${i + 1}`,
      shiftId: 'shift-4',
      employeeId: '1',
      photoUrl: getDummyImageUrl(photoIndex),
      publicId: `shifts/shift-4/photo-${i + 1}`,
      description: photoDescriptions[photoIndex % photoDescriptions.length],
      uploadedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      managerApprovalStatus: 'pending',
      employee: employees[0],
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    });
    photoIndex++;
  }

  return photos;
};

const generateDummyComplaints = (photos: ShiftPhoto[]): Complaint[] => {
  const clients: Client[] = [
    { id: 'client-1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@company.com' },
    { id: 'client-2', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@company.com' },
  ];

  const complaintDescriptions = [
    'The tiles in the bathroom are not properly dried and look streaky. The quality is below standards.',
    'The task appears incomplete - some areas of the conference room still have visible dust on the furniture.',
  ];

  if (photos.length < 2) return [];

  return [
    {
      id: 'complaint-1',
      photoId: 'photo-1-1',
      clientId: 'client-1',
      reason: 'poor_quality',
      description: complaintDescriptions[0],
      status: 'filed',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      ShiftPhoto: photos[0],
      client: clients[0],
    },
    {
      id: 'complaint-2',
      photoId: 'photo-1-2',
      clientId: 'client-2',
      reason: 'task_incomplete',
      description: complaintDescriptions[1],
      status: 'filed',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      ShiftPhoto: photos[1],
      client: clients[1],
    },
  ];
};

// Group photos by shift
const groupPhotosByShift = (photos: ShiftPhoto[]): Record<string, ShiftPhoto[]> => {
  const grouped: Record<string, ShiftPhoto[]> = {};
  photos.forEach((photo) => {
    if (!grouped[photo.shiftId]) {
      grouped[photo.shiftId] = [];
    }
    grouped[photo.shiftId].push(photo);
  });
  return grouped;
};

// Get overall shift status
const getShiftStatus = (photos: ShiftPhoto[]): 'pending' | 'approved' | 'rejected' | 'mixed' => {
  const statuses = photos.map((p) => p.managerApprovalStatus);
  if (statuses.every((s) => s === 'approved')) return 'approved';
  if (statuses.every((s) => s === 'rejected')) return 'rejected';
  if (statuses.every((s) => s === 'pending')) return 'pending';
  return 'mixed';
};

// Calculate grid columns
const getGridColumns = (photoCount: number): string => {
  if (photoCount <= 6) return 'grid-cols-2';
  if (photoCount <= 12) return 'grid-cols-3';
  return 'grid-cols-4';
};

// Photo Preview Modal
interface PhotoPreviewProps {
  photo: ShiftPhoto | null;
  allShiftPhotos: ShiftPhoto[];
  onClose: () => void;
  onNavigate: (photoId: string) => void;
}

const PhotoPreviewModal: React.FC<PhotoPreviewProps> = ({
  photo,
  allShiftPhotos,
  onClose,
  onNavigate,
}) => {
  if (!photo) return null;

  const currentIndex = allShiftPhotos.findIndex((p) => p.id === photo.id);
  const hasNext = currentIndex < allShiftPhotos.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) {
      onNavigate(allShiftPhotos[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      onNavigate(allShiftPhotos[currentIndex - 1].id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Photo {currentIndex + 1} of {allShiftPhotos.length}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              From {photo.employee.firstName} {photo.employee.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Image Display */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-6">
            <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
              <Image
                src={photo.photoUrl}
                alt={`Photo ${currentIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80vw"
                unoptimized
              />
            </div>

            {/* Navigation Arrows */}
            {hasPrev && (
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-colors"
                title="Previous photo (arrow left)"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {hasNext && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-colors"
                title="Next photo (arrow right)"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                  photo.managerApprovalStatus === 'approved'
                    ? 'bg-green-600'
                    : photo.managerApprovalStatus === 'rejected'
                    ? 'bg-red-600'
                    : 'bg-blue-600'
                }`}
              >
                {photo.managerApprovalStatus.charAt(0).toUpperCase() +
                  photo.managerApprovalStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Photo Details */}
          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {photo.description || 'No description provided'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted</h4>
                <p className="text-sm text-gray-600">
                  {new Date(photo.uploadedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Employee</h4>
                <p className="text-sm text-gray-600">
                  {photo.employee.firstName} {photo.employee.lastName}
                </p>
              </div>
            </div>

            {photo.managerComment && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Manager Comment</h4>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                  <p className="text-sm text-gray-700">{photo.managerComment}</p>
                  {photo.managerApprovedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reviewed on {new Date(photo.managerApprovedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">All Photos in Shift</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allShiftPhotos.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => onNavigate(p.id)}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                    p.id === photo.id
                      ? 'ring-2 ring-blue-600 scale-105'
                      : 'hover:opacity-80'
                  }`}
                >
                  <div className="relative w-20 h-20 bg-gray-100">
                    <Image
                      src={p.photoUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                    {idx + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PhotosAndComplaints(): JSX.Element {
  const [photos, setPhotos] = useState<ShiftPhoto[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [approvalComments, setApprovalComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingShiftId, setLoadingShiftId] = useState<string | null>(null);
  const [loadingComplaintId, setLoadingComplaintId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pending' | 'all'>('pending');
  const [expandedShifts, setExpandedShifts] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<ShiftPhoto | null>(null);
  const [previewShiftPhotos, setPreviewShiftPhotos] = useState<ShiftPhoto[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const dummyPhotos = generateDummyPhotos();
      const dummyComplaints = generateDummyComplaints(dummyPhotos);
      setPhotos(dummyPhotos);
      setComplaints(dummyComplaints);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      console.error('Error fetching data:', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openPhotoPreview = (photo: ShiftPhoto, shiftPhotos: ShiftPhoto[]): void => {
    setSelectedPhoto(photo);
    setPreviewShiftPhotos(shiftPhotos);
  };

  const closePhotoPreview = (): void => {
    setSelectedPhoto(null);
    setPreviewShiftPhotos([]);
  };

  const navigateToPhoto = (photoId: string): void => {
    const photo = previewShiftPhotos.find((p) => p.id === photoId);
    if (photo) {
      setSelectedPhoto(photo);
    }
  };

  const approveShift = async (
    shiftId: string,
    status: 'approved' | 'rejected'
  ): Promise<void> => {
    const comment = approvalComments[shiftId] || '';

    if (status === 'rejected' && !comment.trim()) {
      setError('Please add a comment when rejecting a shift');
      return;
    }

    setLoadingShiftId(shiftId);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPhotos((prevPhotos) =>
        prevPhotos.map((photo) =>
          photo.shiftId === shiftId && photo.managerApprovalStatus === 'pending'
            ? {
                ...photo,
                managerApprovalStatus: status,
                managerApprovedAt: new Date().toISOString(),
                managerComment: comment,
                updatedAt: new Date().toISOString(),
              }
            : photo
        )
      );

      setApprovalComments((prev) => {
        const updated = { ...prev };
        delete updated[shiftId];
        return updated;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve shift';
      console.error('Error approving shift:', error);
      setError(errorMessage);
    } finally {
      setLoadingShiftId(null);
    }
  };

  const resolveComplaint = async (
    complaintId: string,
    newStatus: 'filed' | 'under_review' | 'resolved' | 'dismissed'
  ): Promise<void> => {
    setLoadingComplaintId(complaintId);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.id === complaintId
            ? {
                ...complaint,
                status: newStatus,
                resolvedAt:
                  newStatus === 'resolved' || newStatus === 'dismissed'
                    ? new Date().toISOString()
                    : undefined,
                resolutionNote: 'Reviewed by manager',
                updatedAt: new Date().toISOString(),
              }
            : complaint
        )
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to resolve complaint';
      console.error('Error resolving complaint:', error);
      setError(errorMessage);
    } finally {
      setLoadingComplaintId(null);
    }
  };

  const getReasonLabel = (reason: string): string => {
    const reasonMap: Record<string, string> = {
      poor_quality: 'Poor Quality',
      task_incomplete: 'Task Incomplete',
      wrong_location: 'Wrong Location',
      safety_concern: 'Safety Concern',
      other: 'Other',
    };
    return reasonMap[reason] || reason;
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      filed: 'bg-red-100 text-red-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
      pending: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      mixed: 'bg-orange-100 text-orange-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const toggleShiftExpansion = (shiftId: string): void => {
    setExpandedShifts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(shiftId)) {
        newSet.delete(shiftId);
      } else {
        newSet.add(shiftId);
      }
      return newSet;
    });
  };

  const filteredPhotos =
    viewMode === 'pending' ? photos.filter((p) => p.managerApprovalStatus === 'pending') : photos;

  const groupedPhotos = groupPhotosByShift(filteredPhotos);
  const filedComplaints = complaints.filter((c) => c.status === 'filed');

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Photo Preview Modal */}
      <PhotoPreviewModal
        photo={selectedPhoto}
        allShiftPhotos={previewShiftPhotos}
        onClose={closePhotoPreview}
        onNavigate={navigateToPhoto}
      />

      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quality Control Dashboard
          </h1>
          <p className="text-gray-600">Manage photo submissions and customer complaints</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-sm text-red-600 hover:text-red-800 mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Photo Reviews Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Shift Submissions</h2>
            <p className="text-sm text-gray-600 mt-1">
              {viewMode === 'pending'
                ? `${Object.keys(groupedPhotos).length} shift${Object.keys(groupedPhotos).length !== 1 ? 's' : ''} awaiting approval`
                : `${Object.keys(groupPhotosByShift(photos)).length} total shift${Object.keys(groupPhotosByShift(photos)).length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('pending')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All Shifts
              </button>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {Object.keys(groupedPhotos).length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">
              {viewMode === 'pending' ? 'No pending shifts to review' : 'No shifts found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {Object.entries(groupedPhotos).map(([shiftId, shiftPhotos]) => {
              const shiftStatus = getShiftStatus(shiftPhotos);
              const pendingPhotos = shiftPhotos.filter((p) => p.managerApprovalStatus === 'pending');
              const isExpanded = expandedShifts.has(shiftId);
              const canApprove = pendingPhotos.length > 0;
              const gridColumns = getGridColumns(shiftPhotos.length);

              return (
                <div
                  key={shiftId}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                >
                  {/* Shift Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Shift {shiftId.replace('shift-', '')}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shiftStatus)}`}
                          >
                            {shiftStatus.charAt(0).toUpperCase() + shiftStatus.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Employee: {shiftPhotos[0].employee.firstName} {shiftPhotos[0].employee.lastName} •
                          Submitted: {new Date(shiftPhotos[0].uploadedAt).toLocaleDateString()} •
                          {shiftPhotos.length} photo{shiftPhotos.length !== 1 ? 's' : ''}
                          {pendingPhotos.length > 0 && ` • ${pendingPhotos.length} pending`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleShiftExpansion(shiftId)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
                        >
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Shift Content */}
                  <div className="p-6">
                    {/* Image Grid */}
                    <div
                      className={`grid ${gridColumns} gap-3 mb-6 ${
                        !isExpanded && shiftPhotos.length > 8 ? 'max-h-96 overflow-y-auto' : ''
                      }`}
                    >
                      {shiftPhotos.map((photo, index) => (
                        <div key={photo.id} className="relative group">
                          <button
                            onClick={() => openPhotoPreview(photo, shiftPhotos)}
                            className="relative h-32 bg-gray-100 rounded-lg overflow-hidden w-full hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                          >
                            <Image
                              src={photo.photoUrl}
                              alt={`Photo ${index + 1} from shift`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              unoptimized
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                  className="w-8 h-8 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                                </svg>
                              </div>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(photo.managerApprovalStatus)}`}
                              >
                                {photo.managerApprovalStatus.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              #{index + 1}
                            </div>
                          </button>
                          {photo.description && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                              {photo.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {!isExpanded && shiftPhotos.length > 8 && (
                      <div className="text-center mb-6">
                        <button
                          onClick={() => toggleShiftExpansion(shiftId)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Show all {shiftPhotos.length} photos
                        </button>
                      </div>
                    )}

                    {/* Approval Section */}
                    {canApprove ? (
                      <div className="border-t pt-6">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Manager Comment for Shift
                          </label>
                          <textarea
                            placeholder="Add comment for the entire shift (required if rejecting)..."
                            value={approvalComments[shiftId] || ''}
                            onChange={(e) =>
                              setApprovalComments((prev) => ({
                                ...prev,
                                [shiftId]: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            disabled={loadingShiftId === shiftId}
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => approveShift(shiftId, 'approved')}
                            disabled={loadingShiftId === shiftId}
                            className="flex-1 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {loadingShiftId === shiftId
                              ? 'Processing...'
                              : `Approve All (${pendingPhotos.length} photos)`}
                          </button>
                          <button
                            onClick={() => approveShift(shiftId, 'rejected')}
                            disabled={
                              loadingShiftId === shiftId || !approvalComments[shiftId]?.trim()
                            }
                            className="flex-1 bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {loadingShiftId === shiftId
                              ? 'Processing...'
                              : `Reject All (${pendingPhotos.length} photos)`}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-6">
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">Shift Review Completed</p>
                          {shiftPhotos[0]?.managerComment && (
                            <div className="p-3 bg-gray-50 rounded-md">
                              <p className="text-xs font-medium text-gray-700 mb-1">
                                Manager Comment:
                              </p>
                              <p className="text-sm text-gray-600">{shiftPhotos[0].managerComment}</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            Reviewed on{' '}
                            {shiftPhotos[0]?.managerApprovedAt
                              ? new Date(shiftPhotos[0].managerApprovedAt).toLocaleString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filed Complaints Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Filed Complaints</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filedComplaints.length} complaint{filedComplaints.length !== 1 ? 's' : ''} requiring
              attention
            </p>
          </div>
        </div>

        {filedComplaints.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No complaints filed</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Photo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filedComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100">
                          <Image
                            src={complaint.ShiftPhoto.photoUrl}
                            alt="Complaint photo"
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {complaint.client.firstName} {complaint.client.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{complaint.client.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.reason)}`}
                        >
                          {getReasonLabel(complaint.reason)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {complaint.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}
                        >
                          {complaint.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={complaint.status}
                          onChange={(e) =>
                            resolveComplaint(
                              complaint.id,
                              e.target.value as
                                | 'filed'
                                | 'under_review'
                                | 'resolved'
                                | 'dismissed'
                            )
                          }
                          disabled={loadingComplaintId === complaint.id}
                          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pending Shifts</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {
              Object.keys(
                groupPhotosByShift(photos.filter((p) => p.managerApprovalStatus === 'pending'))
              ).length
            }
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Filed Complaints</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{filedComplaints.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Photos</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{photos.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Shifts</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {Object.keys(groupPhotosByShift(photos)).length}
          </p>
        </div>
      </div>
    </div>
  );
}


























// import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
// import axios, { AxiosError } from 'axios';

// interface Employee {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
// }

// interface ShiftPhoto {
//   id: string;
//   shiftId: string;
//   employeeId: string;
//   photoUrl: string;
//   publicId: string;
//   description?: string;
//   uploadedAt: string;
//   managerApprovalStatus: 'pending' | 'approved' | 'rejected';
//   managerApprovedAt?: string;
//   managerComment?: string;
//   employee: Employee;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Client {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
// }

// interface Complaint {
//   id: string;
//   photoId: string;
//   clientId: string;
//   reason: 'poor_quality' | 'task_incomplete' | 'wrong_location' | 'safety_concern' | 'other';
//   description: string;
//   status: 'filed' | 'under_review' | 'resolved' | 'dismissed';
//   resolvedAt?: string;
//   resolutionNote?: string;
//   createdAt: string;
//   updatedAt: string;
//   ShiftPhoto: ShiftPhoto;
//   client: Client;
// }

// interface PhotoApprovalPayload {
//   status: 'approved' | 'rejected';
//   comment: string;
// }

// interface ComplaintResolutionPayload {
//   status: 'filed' | 'under_review' | 'resolved' | 'dismissed';
//   resolutionNote: string;
// }

// export default function PhotosAndComplaints(): JSX.Element {
//   const [photos, setPhotos] = useState<ShiftPhoto[]>([]);
//   const [complaints, setComplaints] = useState<Complaint[]>([]);
//   const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
//   const [approvalComments, setApprovalComments] = useState<Record<string, string>>({});
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [loadingPhotoId, setLoadingPhotoId] = useState<string | null>(null);
//   const [loadingComplaintId, setLoadingComplaintId] = useState<string | null>(null);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async (): Promise<void> => {
//     setLoading(true);
//     setError(null);
//     try {
//       const [photoRes, complaintRes] = await Promise.all([
//         axios.get<ShiftPhoto[]>('/api/photos'),
//         axios.get<Complaint[]>('/api/complaints/dashboard'),
//       ]);
//       setPhotos(photoRes.data);
//       setComplaints(complaintRes.data);
//     } catch (error) {
//       const errorMessage = error instanceof AxiosError 
//         ? error.response?.data?.message || error.message 
//         : 'Failed to fetch data';
//       console.error('Error fetching data:', error);
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const approvePhoto = async (photoId: string, status: 'approved' | 'rejected'): Promise<void> => {
//     const comment = approvalComments[photoId] || '';
    
//     if (status === 'rejected' && !comment.trim()) {
//       setError('Please add a comment when rejecting a photo');
//       return;
//     }

//     setLoadingPhotoId(photoId);
//     setError(null);

//     try {
//       const payload: PhotoApprovalPayload = {
//         status,
//         comment,
//       };

//       await axios.put(`/api/photos/${photoId}/approve`, payload);
      
//       // Clear the comment for this photo
//       setApprovalComments((prev) => {
//         const updated = { ...prev };
//         delete updated[photoId];
//         return updated;
//       });

//       await fetchData();
//     } catch (error) {
//       const errorMessage = error instanceof AxiosError 
//         ? error.response?.data?.message || 'Failed to approve photo' 
//         : 'Failed to approve photo';
//       console.error('Error approving photo:', error);
//       setError(errorMessage);
//     } finally {
//       setLoadingPhotoId(null);
//     }
//   };

//   const resolveComplaint = async (
//     complaintId: string,
//     status: 'filed' | 'under_review' | 'resolved' | 'dismissed'
//   ): Promise<void> => {
//     setLoadingComplaintId(complaintId);
//     setError(null);

//     try {
//       const payload: ComplaintResolutionPayload = {
//         status,
//         resolutionNote: 'Reviewed by manager',
//       };

//       await axios.put(`/api/complaints/${complaintId}`, payload);
//       await fetchData();
//     } catch (error) {
//       const errorMessage = error instanceof AxiosError 
//         ? error.response?.data?.message || 'Failed to resolve complaint' 
//         : 'Failed to resolve complaint';
//       console.error('Error resolving complaint:', error);
//       setError(errorMessage);
//     } finally {
//       setLoadingComplaintId(null);
//     }
//   };

//   const getReasonLabel = (reason: string): string => {
//     const reasonMap: Record<string, string> = {
//       poor_quality: 'Poor Quality',
//       task_incomplete: 'Task Incomplete',
//       wrong_location: 'Wrong Location',
//       safety_concern: 'Safety Concern',
//       other: 'Other',
//     };
//     return reasonMap[reason] || reason;
//   };

//   const getStatusColor = (status: string): string => {
//     const statusColors: Record<string, string> = {
//       filed: 'bg-red-100 text-red-800',
//       under_review: 'bg-yellow-100 text-yellow-800',
//       resolved: 'bg-green-100 text-green-800',
//       dismissed: 'bg-gray-100 text-gray-800',
//       pending: 'bg-blue-100 text-blue-800',
//       approved: 'bg-green-100 text-green-800',
//       rejected: 'bg-red-100 text-red-800',
//     };
//     return statusColors[status] || 'bg-gray-100 text-gray-800';
//   };

//   const pendingPhotos = photos.filter((p) => p.managerApprovalStatus === 'pending');
//   const filedComplaints = complaints.filter((c) => c.status === 'filed');

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-center items-center h-64">
//           <div className="text-lg text-gray-600">Loading...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Quality Control Dashboard</h1>
//         <p className="text-gray-600">Manage photo submissions and customer complaints</p>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <p className="text-red-800 font-medium">{error}</p>
//           <button
//             onClick={() => setError(null)}
//             className="text-sm text-red-600 hover:text-red-800 mt-2"
//           >
//             Dismiss
//           </button>
//         </div>
//       )}

//       {/* Pending Photos Section */}
//       <div className="mb-12">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h2 className="text-2xl font-semibold text-gray-900">Pending Photo Reviews</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               {pendingPhotos.length} photo{pendingPhotos.length !== 1 ? 's' : ''} awaiting approval
//             </p>
//           </div>
//           <button
//             onClick={fetchData}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
//           >
//             Refresh
//           </button>
//         </div>

//         {pendingPhotos.length === 0 ? (
//           <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
//             <p className="text-gray-500 text-lg">No pending photos to review</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {pendingPhotos.map((photo) => (
//               <div
//                 key={photo.id}
//                 className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <div className="relative h-48 bg-gray-100">
//                   <Image
//                     src={photo.photoUrl}
//                     alt={`Photo by ${photo.employee.firstName} ${photo.employee.lastName}`}
//                     fill
//                     className="object-cover"
//                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                   />
//                 </div>

//                 <div className="p-4">
//                   <div className="mb-3 pb-3 border-b border-gray-200">
//                     <p className="text-sm font-medium text-gray-900">
//                       {photo.employee.firstName} {photo.employee.lastName}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {new Date(photo.uploadedAt).toLocaleString()}
//                     </p>
//                   </div>

//                   {photo.description && (
//                     <div className="mb-3 pb-3 border-b border-gray-200">
//                       <p className="text-sm text-gray-700 line-clamp-3">{photo.description}</p>
//                     </div>
//                   )}

//                   <div className="mb-4">
//                     <label className="block text-xs font-medium text-gray-700 mb-2">
//                       Manager Comment
//                     </label>
//                     <textarea
//                       placeholder="Add comment (required if rejecting)..."
//                       value={approvalComments[photo.id] || ''}
//                       onChange={(e) =>
//                         setApprovalComments((prev) => ({
//                           ...prev,
//                           [photo.id]: e.target.value,
//                         }))
//                       }
//                       className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                       rows={3}
//                       disabled={loadingPhotoId === photo.id}
//                     />
//                   </div>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => approvePhoto(photo.id, 'approved')}
//                       disabled={loadingPhotoId === photo.id}
//                       className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
//                     >
//                       {loadingPhotoId === photo.id ? 'Processing...' : 'Approve'}
//                     </button>
//                     <button
//                       onClick={() => approvePhoto(photo.id, 'rejected')}
//                       disabled={loadingPhotoId === photo.id}
//                       className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
//                     >
//                       {loadingPhotoId === photo.id ? 'Processing...' : 'Reject'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Filed Complaints Section */}
//       <div className="mb-12">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h2 className="text-2xl font-semibold text-gray-900">Filed Complaints</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               {filedComplaints.length} complaint{filedComplaints.length !== 1 ? 's' : ''} requiring attention
//             </p>
//           </div>
//         </div>

//         {filedComplaints.length === 0 ? (
//           <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
//             <p className="text-gray-500 text-lg">No complaints filed</p>
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                       Photo
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                       Client
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                       Reason
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                       Description
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filedComplaints.map((complaint) => (
//                     <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100">
//                           <Image
//                             src={complaint.ShiftPhoto.photoUrl}
//                             alt="Complaint photo"
//                             fill
//                             className="object-cover"
//                             sizes="64px"
//                           />
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div>
//                           <p className="text-sm font-medium text-gray-900">
//                             {complaint.client.firstName} {complaint.client.lastName}
//                           </p>
//                           <p className="text-xs text-gray-500">{complaint.client.email}</p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.reason)}`}>
//                           {getReasonLabel(complaint.reason)}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm text-gray-700 line-clamp-2">{complaint.description}</p>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
//                           {complaint.status.replace(/_/g, ' ')}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <select
//                           value={complaint.status}
//                           onChange={(e) =>
//                             resolveComplaint(
//                               complaint.id,
//                               e.target.value as 'filed' | 'under_review' | 'resolved' | 'dismissed'
//                             )
//                           }
//                           disabled={loadingComplaintId === complaint.id}
//                           className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
//                         >
//                           <option value="filed">Filed</option>
//                           <option value="under_review">Under Review</option>
//                           <option value="resolved">Resolved</option>
//                           <option value="dismissed">Dismissed</option>
//                         </select>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Summary Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <p className="text-sm text-gray-600">Pending Photos</p>
//           <p className="text-2xl font-bold text-blue-600 mt-1">{pendingPhotos.length}</p>
//         </div>
//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <p className="text-sm text-gray-600">Filed Complaints</p>
//           <p className="text-2xl font-bold text-red-600 mt-1">{filedComplaints.length}</p>
//         </div>
//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <p className="text-sm text-gray-600">Total Photos</p>
//           <p className="text-2xl font-bold text-purple-600 mt-1">{photos.length}</p>
//         </div>
//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <p className="text-sm text-gray-600">Total Complaints</p>
//           <p className="text-2xl font-bold text-orange-600 mt-1">{complaints.length}</p>
//         </div>
//       </div>
//     </div>
//   );
// }