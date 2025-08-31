'use client';

import { LogOut, User, Settings, HelpCircle, Bell, ChevronDown, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/common/LoadingSpinner';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';



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
      sidebarCollapsed ? "ml-2" : "ml-6"
    )}>
      <h1 className="text-lg font-semibold text-slate-800 whitespace-nowrap">
        {title}
      </h1>
    </div>
  );
};

interface NavbarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  sidebarCollapsed, 
  onToggleSidebar,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get user data from auth context
  const { user, logout, isAuthenticated } = useAuth();

  // Generate initials from user name
  const getUserInitials = () => {
    if (!user) return 'U';
    
    const { first_name, last_name } = user;
    if (first_name && last_name) {
      return `${first_name.charAt(0)}${last_name.charAt(0)}`.toUpperCase();
    }
    if (first_name) {
      return first_name.charAt(0).toUpperCase();
    }
    if (last_name) {
      return last_name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    if (user.last_name) {
      return user.last_name;
    }
    return user.email?.split('@')[0] || 'User';
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
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

  // Don't render navbar on login page or if not authenticated
  if (pathname === '/login' || !isAuthenticated) return null;

  return (
    <nav className={cn(
      "border-b border-gray-300 sticky top-0 z-20",
      "bg-white",
      "transition-all duration-300 ease-in-out",
      "w-full"
    )}>
      <div className={cn(
        "mx-auto p-1.25 flex justify-between items-center",
        "transition-spacing duration-300 ease-in-out"
      )}>
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-teal-100 transition text-teal-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <NavTitle sidebarCollapsed={sidebarCollapsed} />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button 
            className={cn(
              "relative p-2 rounded-full transition-colors",
              "text-teal-600 hover:bg-teal-100 hover:text-teal-700"
            )}
            onClick={() => setHasUnreadNotifications(false)}
          >
            <Bell className="h-5 w-5" />
            {hasUnreadNotifications && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-teal-700"></span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className={cn(
                "flex items-center gap-2 rounded-lg p-1.5 transition-colors",
                "hover:bg-teal-100 border border-transparent text-teal-700",
                isDropdownOpen && "bg-teal-100"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white font-medium">
                {getUserInitials()}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-900">
                  {getUserDisplayName()}
                </span>
                <span className="text-xs text-slate-900">
                  {/* You might want to add role to your User type or get it from another source */}
                  Admin
                </span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform text-teal-600",
                isDropdownOpen ? "rotate-180" : ""
              )} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white border border-teal-200">
                <div className="py-3 px-4 border-b border-teal-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-medium">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {user?.email || 'No email'}
                      </p>
                      <p className="text-xs text-slate-700 font-medium mt-1">
                        {/* You might want to add role to your User type */}
                        Admin
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="py-1">
                  <Link 
                    href="/admin/profile" 
                    className="flex items-center px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3 text-teal-600" />
                    Your Profile
                  </Link>
                  <Link 
                    href="/admin/settings" 
                    className="flex items-center px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3 text-teal-600" />
                    Settings
                  </Link>
                  <Link 
                    href="/admin/support" 
                    className="flex items-center px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <HelpCircle className="h-4 w-4 mr-3 text-teal-600" />
                    Help & Support
                  </Link>
                </div>
                
                <div className="py-1 border-t border-teal-200">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cn(
                      "flex items-center w-full px-4 py-2 text-sm text-left",
                      "text-slate-900 hover:bg-teal-50",
                      isLoggingOut ? "opacity-70" : ""
                    )}
                  >
                    {isLoggingOut ? (
                      <LoadingSpinner className="h-4 w-4 mr-3 text-teal-700" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-3 text-teal-600" />
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