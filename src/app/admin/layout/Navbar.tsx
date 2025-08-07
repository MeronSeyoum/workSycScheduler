'use client';

import { LogOut, User, Settings, HelpCircle, Bell, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';

// Helper function to generate page titles
const getPageTitle = (pathname: string) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return 'Dashboard';
  
  const lastSegment = pathSegments[pathSegments.length - 1];
  
  const titles: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    employees: 'Employee Management',
    attendance: 'Attendance Time Tracking',
    shifts: 'Multi-Location Shift Scheduler',
    clients: 'Client Management',
    users: 'User Management',
    qrcode: 'QR Code Management',
    reports: 'Analytics Reports',
    settings: 'System Settings',
    list: 'All Records',
    new: 'Create New',
    edit: 'Edit Details'
  };

  return titles[lastSegment] || 
    lastSegment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

const NavTitle = ({ sidebarCollapsed }: { sidebarCollapsed: boolean }) => {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className={cn(
      "flex items-center transition-all duration-300",
      sidebarCollapsed ? "ml-2" : "ml-0"
    )}>
      <h1 className="text-lg font-semibold text-[#0F6973] whitespace-nowrap">
        {title}
      </h1>
    </div>
  );
};

interface NavbarProps {
  sidebarCollapsed: boolean;
  onLogout: () => Promise<void>;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userAvatar?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  sidebarCollapsed, 
  onLogout, 
  userName = 'User',
  userEmail = 'user@example.com',
  userRole = 'Admin',
  userAvatar
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (hasUnreadNotifications) {
      setHasUnreadNotifications(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Don't show navbar on login page
  if (pathname === '/login') return null;

  return (
    <nav className={cn(
      "bg-[#e5f0F0] border-b border-gray-200 sticky top-0 z-30",
      "transition-all duration-300 ease-in-out",
      "w-[calc(100%-0rem)]",
      !sidebarCollapsed && "w-[calc(100%)]"
    )}>
      <div className={cn(
        "mx-auto h-15 flex justify-between items-center",
        "transition-spacing duration-300 ease-in-out",
        sidebarCollapsed ? "pl-[6rem]" : "pl-[1rem]",
        "pr-6 sm:pr-8 lg:pr-10"
      )}>
        <div className="flex items-start">
          <NavTitle sidebarCollapsed={sidebarCollapsed} />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button 
            className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setHasUnreadNotifications(false)}
          >
            <Bell className="h-5 w-5" />
            {hasUnreadNotifications && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-1 transition-colors"
            >
              <Avatar 
                src={userAvatar} 
                name={userName} 
                size="sm" 
                className="border-2 border-[#0F6973]"
              />
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900">{userName}</span>
                <span className="text-xs text-gray-500">{userRole}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-3 px-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={userAvatar} 
                      name={userName} 
                      size="md" 
                      className="border-2 border-[#0F6973]"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                      <p className="text-xs text-[#0F6973] font-medium mt-1">{userRole}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-1">
                  <Link 
                    href="/admin/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3 text-gray-500" />
                    Your Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-500" />
                    Settings
                  </Link>
                  <Link 
                    href="/help" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
                    Help & Support
                  </Link>
                </div>
                
                <div className="py-1 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    {isLoggingOut ? (
                      <LoadingSpinner className="h-4 w-4 mr-3" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-3" />
                    )}
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;