import React, { useState, useMemo } from 'react';
import { 
  AlertCircle, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  X, 
  Bell,
  Search,
  ChevronRight,
  Zap,
  Pause,
  CheckCheck
} from 'lucide-react';

export type IssueType = 'schedule' | 'location' | 'staffing' | 'instructions' | 'emergency' | 'other';
export type RequestStatus = 'pending' | 'in_progress' | 'resolved';

export interface HelpRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftId: string;
  issueType: IssueType;
  actionSelected: string;
  timestamp: string;
  location: string;
  status: RequestStatus;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

const mockRequests: HelpRequest[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'John Smith',
    shiftId: 'SHIFT_6PM',
    issueType: 'emergency',
    actionSelected: 'Call manager immediately',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    location: 'Sobeys - Downtown',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    priority: 'high',
    assignedTo: 'Manager A'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'Sarah Johnson',
    shiftId: 'SHIFT_6PM',
    issueType: 'location',
    actionSelected: 'Request 15-minute delay',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    location: 'Sobeys - Uptown',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    priority: 'medium',
    assignedTo: 'Supervisor B'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: 'Mike Davis',
    shiftId: 'SHIFT_6PM',
    issueType: 'staffing',
    actionSelected: 'Alert manager about understaffing',
    timestamp: new Date(Date.now() - 23 * 60000).toISOString(),
    location: 'Sobeys - Downtown',
    status: 'resolved',
    createdAt: new Date(Date.now() - 23 * 60000).toISOString(),
    priority: 'high',
    assignedTo: 'Manager A'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    employeeName: 'Emma Wilson',
    shiftId: 'SHIFT_2PM',
    issueType: 'schedule',
    actionSelected: 'Request shift swap for Friday',
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    location: 'Sobeys - Westside',
    status: 'pending',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    priority: 'low',
    assignedTo: 'Coordinator C'
  }
];

export const DashboardHelpRequests: React.FC<{ maxItems?: number }> = ({ maxItems = 4 }) => {
  const [requests, setRequests] = useState<HelpRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const IssueIconMap = {
    schedule: Clock,
    location: MapPin,
    staffing: Users,
    instructions: FileText,
    emergency: AlertCircle,
    other: MessageSquare,
  };

  const statusConfig = {
    pending: { 
      bg: 'bg-amber-50', 
      border: 'border-amber-200', 
      text: 'text-amber-700', 
      badge: 'bg-amber-100 text-amber-800 border border-amber-200',
      icon: AlertCircle 
    },
    in_progress: { 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      text: 'text-blue-700', 
      badge: 'bg-blue-100 text-blue-800 border border-blue-200',
      icon: Pause 
    },
    resolved: { 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200', 
      text: 'text-emerald-700', 
      badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      icon: CheckCheck 
    },
  };

  const priorityColors = {
    high: { 
      bg: 'bg-red-50', 
      text: 'text-red-700', 
      badge: 'bg-red-100 text-red-800 border border-red-200',
      dot: 'bg-red-500' 
    },
    medium: { 
      bg: 'bg-orange-50', 
      text: 'text-orange-700', 
      badge: 'bg-orange-100 text-orange-800 border border-orange-200',
      dot: 'bg-orange-500' 
    },
    low: { 
      bg: 'bg-green-50', 
      text: 'text-green-700', 
      badge: 'bg-green-100 text-green-800 border border-green-200',
      dot: 'bg-green-500' 
    }
  };

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
    highPriority: requests.filter(r => r.priority === 'high').length,
  }), [requests]);

  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => (filter === 'all' ? true : req.status === filter))
      .filter((req) => 
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, maxItems);
  }, [requests, filter, searchTerm, maxItems]);

  const handleUpdateStatus = (requestId: string, newStatus: RequestStatus) => {
    setRequests(
      requests.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
    setSelectedRequest(null);
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full max-h-[600px] flex flex-col"> {/* Reasonable height cap */}
      {/* Compact Header with Mini Stats */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">Help Requests</h3>
            {stats.pending > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {stats.pending}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${stats.pending > 0 ? 'bg-amber-500' : 'bg-gray-300'}`} />
            <span>{stats.pending} pending</span>
          </div>
        </div>

        {/* Mini Stats Row */}
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-gray-600">{stats.inProgress} in progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-gray-600">{stats.resolved} resolved</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-red-500" />
            <span className="text-gray-600">{stats.highPriority} high</span>
          </div>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Compact List with All Information */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-xs">No requests found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRequests.map((request) => {
              const IconComponent = IssueIconMap[request.issueType];
              const statusConfig_item = statusConfig[request.status];
              const priorityConfig = priorityColors[request.priority || 'medium'];

              return (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`p-3 border rounded-lg cursor-pointer transition hover:shadow-sm ${statusConfig_item.border} ${statusConfig_item.bg} hover:border-gray-300`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon with Priority Dot */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className={`p-2 rounded ${
                        request.issueType === 'emergency' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-3 h-3 ${
                          request.issueType === 'emergency' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      </div>
                      {request.priority && (
                        <div className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {request.employeeName}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${statusConfig_item.badge}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                        {request.priority && (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${priorityConfig.badge}`}>
                            {request.priority}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-600 capitalize">{request.issueType}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{request.location}</span>
                        </div>
                        
                        <p className="text-xs text-gray-700 line-clamp-1">
                          {request.actionSelected}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                          <span>{getTimeAgo(request.timestamp)}</span>
                          <span>•</span>
                          <span className="font-mono">{request.employeeId}</span>
                          {request.assignedTo && (
                            <>
                              <span>•</span>
                              <span>Assigned: {request.assignedTo}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compact Footer */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">
            Showing <span className="font-semibold">{filteredRequests.length}</span> of <span className="font-semibold">{stats.total}</span>
          </span>
          <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            View all
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Detailed Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Request Details</h3>
                <p className="text-blue-100 text-xs mt-0.5">Complete information and actions</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 hover:bg-blue-700 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Employee Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Employee Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Name</p>
                    <p className="font-medium">{selectedRequest.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Employee ID</p>
                    <p className="font-mono">{selectedRequest.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Shift</p>
                    <p className="font-medium">{selectedRequest.shiftId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Location</p>
                    <p className="font-medium">{selectedRequest.location}</p>
                  </div>
                </div>
              </div>

              {/* Issue Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Issue Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded ${
                      selectedRequest.issueType === 'emergency' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {React.createElement(IssueIconMap[selectedRequest.issueType], {
                        className: `w-4 h-4 ${
                          selectedRequest.issueType === 'emergency' ? 'text-red-600' : 'text-blue-600'
                        }`
                      })}
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Issue Type</p>
                      <p className="font-medium capitalize text-sm">{selectedRequest.issueType}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Action Required</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                      {selectedRequest.actionSelected}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      statusConfig[selectedRequest.status].badge
                    }`}>
                      {selectedRequest.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      priorityColors[selectedRequest.priority || 'medium'].badge
                    }`}>
                      {selectedRequest.priority || 'medium'} priority
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Close
                </button>
                {selectedRequest.status !== 'in_progress' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'in_progress')}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-1"
                  >
                    <Pause className="w-3 h-3" />
                    In Progress
                  </button>
                )}
                {selectedRequest.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'resolved')}
                    className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHelpRequests;