// src/components/user/UserCard.tsx
import React, { useState } from 'react';
import {
  Edit3,
  Trash2,
  Lock,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  MoreHorizontal,
  UserCheck,
  Shield,
  Star,
  Clock,
  Phone,
  MapPin,
  MessageCircle,
  Bell,
  Zap,
  UserX,
  User as UserIcon,
  CheckCircle,
  XCircle,
  MoreVertical,
  Copy,
  MailIcon
} from 'lucide-react';
import { User } from '@/lib/types/user';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onResetPassword: (id: number) => void;
  onSendMessage?: (user: User) => void;
  onViewProfile?: (user: User) => void;
  onToggleStatus?: (id: number, newStatus: User['status']) => void;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  compact?: boolean;
  showActions?: boolean;
}

const roleColors = {
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  manager: "bg-blue-100 text-blue-800 border-blue-200",
  employee: "bg-green-100 text-green-800 border-green-200"
};

const statusColors = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  inactive: "bg-amber-100 text-amber-800 border-amber-200",
  suspended: "bg-red-100 text-red-800 border-red-200"
};

const roleIcons = {
  admin: Shield,
  manager: UserCheck,
  employee: UserIcon
};

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onResetPassword,
  onSendMessage,
  onViewProfile,
  onToggleStatus,
  isSelected = false,
  onSelect,
  compact = false,
  showActions = true
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const RoleIcon = roleIcons[user.role];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return formatDate(dateString);
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    switch (action) {
      case 'edit':
        onEdit(user);
        break;
      case 'resetPassword':
        onResetPassword(user.id);
        break;
      case 'sendMessage':
        onSendMessage?.(user);
        break;
      case 'viewProfile':
        onViewProfile?.(user);
        break;
      case 'toggleActive':
        onToggleStatus?.(user.id, user.status === 'active' ? 'inactive' : 'active');
        break;
      case 'delete':
        onDelete(user.id);
        break;
    }
  };

  const getPerformanceScore = (userId: number) => {
    // Mock performance score based on user ID for demo
    return (userId % 5) + 1;
  };

  const performanceScore = getPerformanceScore(user.id);

  if (compact) {
    return (
      <div
        className={`bg-white rounded-lg border transition-all duration-200 cursor-pointer group ${
          isSelected 
            ? 'border-blue-400 shadow-md shadow-blue-100' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        } ${user.status === 'suspended' ? 'opacity-60' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowMenu(false);
        }}
        onClick={() => onSelect?.(user.id)}
      >
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  user.status === 'active' ? 'bg-green-500' :
                  user.status === 'inactive' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </h3>
                  {user.is_login && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${roleColors[user.role]}`}>
                <RoleIcon size={12} className="mr-1" />
                {user.role.charAt(0).toUpperCase()}
              </span>
              
              {showActions && (
                <div className="relative">
                  <button 
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                  >
                    <MoreVertical size={14} />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-6 w-36 bg-white rounded-lg shadow-lg border z-50 py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuAction('edit');
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuAction('viewProfile');
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <UserIcon size={14} />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuAction('sendMessage');
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <MessageCircle size={14} />
                        <span>Message</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer group ${
        isSelected 
          ? 'border-blue-400 shadow-lg shadow-blue-100 transform scale-[1.02]' 
          : isHovered 
            ? 'border-gray-300 shadow-md' 
            : 'border-gray-200 hover:border-gray-300'
      } ${user.status === 'suspended' ? 'opacity-75 grayscale' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
      onClick={() => onSelect?.(user.id)}
    >
      {/* Header Section */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-lg ring-2 ring-white shadow-lg">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </div>
              
              {/* Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                user.status === 'active' ? 'bg-green-500' :
                user.status === 'inactive' ? 'bg-amber-500' : 'bg-red-500'
              }`}>
                {user.status === 'active' && <CheckCircle size={10} className="text-white" />}
                {user.status === 'suspended' && <XCircle size={10} className="text-white" />}
              </div>

              {/* Online Status */}
              {user.is_login && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <Zap size={10} className="text-white" />
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {user.first_name} {user.last_name}
                </h3>
                
                {/* Performance Stars */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={14} 
                      className={`${star <= performanceScore ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              
              {/* Role and Status Badges */}
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${roleColors[user.role]}`}>
                  <RoleIcon size={12} className="mr-1" />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${statusColors[user.status]}`}>
                  {user.status === 'active' && <CheckCircle size={12} className="mr-1" />}
                  {user.status === 'inactive' && <Clock size={12} className="mr-1" />}
                  {user.status === 'suspended' && <UserX size={12} className="mr-1" />}
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  showDetails 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={showDetails ? "Hide details" : "Show details"}
              >
                {showDetails ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              
              <div className="relative">
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  title="More actions"
                >
                  <MoreHorizontal size={18} />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border z-50">
                    <div className="py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuAction('edit');
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit3 size={16} />
                        <span>Edit User</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuAction('viewProfile');
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <UserIcon size={16} />
                        <span>View Profile</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuAction('sendMessage');
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <MessageCircle size={16} />
                        <span>Send Message</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuAction('resetPassword');
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Lock size={16} />
                        <span>Reset Password</span>
                      </button>

                      <hr className="my-2" />
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuAction('toggleActive');
                        }}
                        className={`flex items-center space-x-2 w-full px-4 py-2 text-sm ${
                          user.status === 'active' 
                            ? 'text-amber-600 hover:bg-amber-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                        <span>{user.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuAction('delete');
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        <span>Delete User</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Info Bar */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div 
              className="flex items-center space-x-1 hover:text-gray-800 cursor-pointer group/email"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(user.email, 'email');
              }}
              title="Copy email"
            >
              <Mail size={14} />
              <span className="truncate max-w-32 sm:max-w-48">{user.email}</span>
              {copiedField === 'email' && (
                <CheckCircle size={12} className="text-green-500 ml-1" />
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>Joined {formatDate(user.created_at)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
            <Clock size={12} />
            <span>Updated {getTimeAgo(user.updated_at)}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className={`text-center p-3 rounded-lg transition-colors ${
            user.is_login ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className={`text-lg font-semibold ${user.is_login ? 'text-green-600' : 'text-gray-600'}`}>
              {user.is_login ? 'Online' : 'Offline'}
            </div>
            <div className="text-xs text-gray-600 mt-1">Status</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-semibold text-blue-900 capitalize">{user.role}</div>
            <div className="text-xs text-blue-600 mt-1">Role</div>
          </div>
          
          <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-lg font-semibold text-emerald-900 capitalize">{user.status}</div>
            <div className="text-xs text-emerald-600 mt-1">Account</div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Performance Score</span>
            <span className="font-semibold text-gray-900">{performanceScore}/5</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(performanceScore / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      {showDetails && (
        <div className="px-6 pb-6 border-t bg-gray-50/50">
          <div className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">User ID</div>
                <div className="font-medium flex items-center space-x-2">
                  <span>{user.id}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(user.id.toString(), 'id');
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Copy ID"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
              
              <div>
                <div className="text-gray-600 mb-1">UUID</div>
                <div className="font-medium flex items-center space-x-2">
                  <span className="text-xs font-mono truncate">{user.uuid}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(user.uuid, 'uuid');
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Copy UUID"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
              
              <div>
                <div className="text-gray-600 mb-1">Created</div>
                <div className="font-medium">{formatDate(user.created_at)}</div>
              </div>
              
              <div>
                <div className="text-gray-600 mb-1">Last Updated</div>
                <div className="font-medium">{formatDate(user.updated_at)}</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendMessage?.(user);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageCircle size={12} />
                <span>Message</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`mailto:${user.email}`, '_blank');
                }}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MailIcon size={12} />
                <span>Email</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile?.(user);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserIcon size={12} />
                <span>Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};