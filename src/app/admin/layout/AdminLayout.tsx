'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Clock, Calendar, MapPin, ClipboardList, 
  FileSpreadsheet, ChevronLeft, ChevronRight, QrCode, X, Menu, 
  UserCircle, Settings, Bell, LogOut, User, HelpCircle, ChevronDown 
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingSpinner from '@/components/ui/common/LoadingSpinner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Utility function for class names
const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Navigation items
const topNavItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/employees', icon: Users, label: 'Employees' },
  // { href: '/admin/clients', icon: UserCircle, label: 'Clients' },
  { href: '/admin/locations', icon: MapPin, label: 'Locations' },
  // { href: '/admin/geofences', icon: MapPin, label: 'Geofences' },
  // { href: '/admin/qrcode', icon: QrCode, label: 'QR Codes' },
  { href: '/admin/shifts', icon: Calendar, label: 'Scheduling' },
  { href: '/admin/attendance', icon: Clock, label: 'Attendance' },
  { href: '/admin/users', icon: Settings, label: 'User Management' },
];

const reportsNavItems = [
  { href: '/admin/reports/time', icon: Clock, label: 'Time Reports' },
  { href: '/admin/reports/attendance', icon: ClipboardList, label: 'Attendance' },
  { href: '/admin/reports/export', icon: FileSpreadsheet, label: 'Data Export' },
];

// Page title helper
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
    locations: 'Client Management',
    users: 'User Management',
    qrcode: 'QR Code Management',
    reports: 'Analytics Reports',
    settings: 'System Settings',
  };

  return titles[lastSegment] || 
    lastSegment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

// Main Admin Layout Component
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const { user, isLoading, logout } = useAuth();

  // Handle auth state and redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Handle mobile menu close when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    router.push(href);
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    return user?.first_name?.charAt(0).toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.first_name || user?.email?.split('@')[0] || 'User';
  };

  const handleLogout = async () => {
    try {
      setIsNavigating(true);
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsNavigating(false);
    }
  };

  // Navigation Item Component
  const NavItem = ({ item, onClick }: { item: any; onClick: () => void }) => {
    const Icon = item.icon;
    return (
      <li>
        <button
          onClick={onClick}
          className={cn(
            'w-full flex items-center p-3 rounded-lg text-sm gap-3 hover:bg-teal-50 transition-all duration-200 mb-3',
            'border border-transparent hover:border-teal-200 text-left',
            isActive(item.href)
              ? 'bg-teal-100 text-teal-700 font-medium border-teal-300 shadow-sm'
              : 'text-slate-700 hover:text-teal-700',
            sidebarCollapsed && !mobileMenuOpen ? 'lg:justify-center' : ''
          )}
        >
          <Icon className={cn(
            'h-5 w-5 flex-shrink-0',
            isActive(item.href) ? 'text-teal-700' : 'text-teal-600'
          )} />
          {(!sidebarCollapsed || mobileMenuOpen) && <span className="truncate">{item.label}</span>}
        </button>
      </li>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <LoadingSpinner className="h-12 w-12 text-teal-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 relative overflow-hidden">
      {/* Loading overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingSpinner className="h-12 w-12 text-teal-700" />
          <span className="sr-only">Loading...</span>
        </div>
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-teal-300/10 via-teal-400/5 to-teal-600/8 backdrop-blur-3xl border border-white/5" />
        <div className="absolute bottom-20 -left-32 w-80 h-80 bg-gradient-to-tr from-teal-400/15 via-teal-300/8 to-teal-500/10 backdrop-blur-3xl rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-teal-200/8 via-teal-200/10 to-teal-300/8 backdrop-blur-3xl rounded-3xl border border-white/5 rotate-45" />
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            'bg-white text-slate-900 shadow-lg h-screen fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out flex flex-col',
            // Desktop behavior
            'lg:relative lg:z-30 lg:translate-x-0',
            sidebarCollapsed ? 'lg:w-16' : 'lg:w-64',
            // Mobile behavior
            mobileMenuOpen ? 'translate-x-0 w-80' : '-translate-x-full w-80'
          )}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 min-h-[73px]">
            {/* Logo */}
            <div className={cn(
              'flex items-center gap-2',
              sidebarCollapsed && !mobileMenuOpen ? 'lg:hidden' : ''
            )}>
              <div className="bg-teal-700 p-1.5 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-teal-800">WorkSync</h2>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              {/* Mobile Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close Sidebar"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>

              {/* Desktop Collapse Button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-1.5 hover:bg-teal-100 transition rounded-full border border-teal-300 text-teal-700"
                aria-label="Toggle Sidebar"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2">
            {/* Main Navigation */}
            {/* <div className="px-3 mb-4">
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <p className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-2">Main</p>
              )}
            </div> */}
            <ul className="space-y-1 px-2">
              {topNavItems.map((item) => (
                <NavItem 
                  key={item.href} 
                  item={item} 
                  onClick={() => handleNavClick(item.href)}
                />
              ))}
            </ul>

            {/* Reports Section */}
            <div className="px-3 mt-8 mb-4">
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <p className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-2">Reports</p>
              )}
            </div>
            <ul className="space-y-1 px-3">
              {reportsNavItems.map((item) => (
                <NavItem 
                  key={item.href} 
                  item={item} 
                  onClick={() => handleNavClick(item.href)}
                />
              ))}
            </ul>
          </nav>

          {/* Mobile Footer */}
          <div className="lg:hidden border-t border-gray-200 p-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">WorkSync Admin Panel</p>
              <p className="text-xs text-gray-400 mt-1">v2.1.0</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <nav className="border-b border-gray-300 sticky top-0 z-20 bg-white w-full">
            <div className="mx-auto p-3 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-md hover:bg-teal-100 transition text-teal-700"
                >
                  <Menu className="h-5 w-5" />
                </button>
                
                {/* Page Title */}
                <div className={cn(
                  "flex items-center transition-all duration-300",
                  sidebarCollapsed ? "lg:ml-2" : "lg:ml-6"
                )}>
                  <h1 className="text-base lg:text-lg font-semibold text-slate-800 truncate">
                    {getPageTitle(pathname)}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                {/* Notification Bell */}
                <button 
                  className="relative p-2 rounded-full transition-colors text-teal-600 hover:bg-teal-100 hover:text-teal-700"
                  onClick={() => setHasUnreadNotifications(false)}
                >
                  <Bell className="h-5 w-5" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-teal-700"></span>
                  )}
                </button>

                {/* User Profile Dropdown */}
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-teal-100 border border-transparent text-teal-700',
                      isDropdownOpen && 'bg-teal-100'
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white font-medium text-sm">
                      {getUserInitials()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium text-slate-900 truncate max-w-32">
                        {getUserDisplayName()}
                      </span>
                      <span className="text-xs text-slate-600">Admin</span>
                    </div>
                    <ChevronDown className={cn(
                      'h-4 w-4 transition-transform text-teal-600',
                      isDropdownOpen ? 'rotate-180' : ''
                    )} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white border border-teal-200 z-50">
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
                              {user?.email}
                            </p>
                            <p className="text-xs text-slate-700 font-medium mt-1">Admin</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <button className="flex items-center w-full px-4 py-2 text-sm text-slate-900 hover:bg-slate-50 text-left">
                          <User className="h-4 w-4 mr-3 text-teal-600" />
                          Your Profile
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-slate-900 hover:bg-slate-50 text-left">
                          <Settings className="h-4 w-4 mr-3 text-teal-600" />
                          Settings
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-slate-900 hover:bg-slate-50 text-left">
                          <HelpCircle className="h-4 w-4 mr-3 text-teal-600" />
                          Help & Support
                        </button>
                      </div>
                      
                      <div className="py-1 border-t border-teal-200">
                        <button
                          onClick={handleLogout}
                          disabled={isNavigating}
                          className={cn(
                            'flex items-center w-full px-4 py-2 text-sm text-left text-slate-900 hover:bg-teal-50',
                            isNavigating ? 'opacity-70' : ''
                          )}
                        >
                          {isNavigating ? (
                            <div className="h-4 w-4 mr-3 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
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

          <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fadeIn" key={pathname}>
            <div className=" mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;


// 'use client';

// import { useState, useEffect } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import Sidebar from '@/app/admin/layout/Sidebar';
// import Navbar from '@/app/admin/layout/Navbar';
// import { useAuth } from '@/components/providers/AuthProvider';
// import LoadingSpinner from '@/components/ui/common/LoadingSpinner';

// interface AdminLayoutProps {
//   children: React.ReactNode;
// }

// const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [isNavigating, setIsNavigating] = useState(false);
//   const { user, isLoading, logout } = useAuth();

//   // Handle auth state and redirect if not authenticated
//   useEffect(() => {
//     if (!isLoading && !user) {
//       router.push('/login');
//     }
//   }, [user, isLoading, router]);

//   const handleLogout = async () => {
//     try {
//       setIsNavigating(true);
//       await logout();
//       router.push('/login');
//     } catch (error) {
//       console.error('Logout failed:', error);
//       setIsNavigating(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
//         <LoadingSpinner className="h-12 w-12 text-teal-700" />
//       </div>
//     );
//   }

//   return (
//    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-130 relative overflow-hidden">
//       {/* Loading overlay */}
//       {isNavigating && (
//         <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
//           <LoadingSpinner className="h-12 w-12 text-teal-700" />
//           <span className="sr-only">Loading...</span>
//         </div>
//       )}

//       {/* Background Elements */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-teal-300/10 via-teal-400/5 to-teal-600/8 backdrop-blur-3xl border border-white/5" />
//         <div className="absolute bottom-20 -left-32 w-80 h-80 bg-gradient-to-tr from-teal-400/15 via-teal-300/8 to-teal-500/10 backdrop-blur-3xl rounded-full border border-white/5" />
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-teal-200/8 via-teal-200/10 to-teal-300/8 backdrop-blur-3xl rounded-3xl border border-white/5 rotate-45" />
//       </div>

//       <div className="relative z-10 flex h-screen">
//         {/* Desktop Sidebar */}
//         <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out hidden lg:block`}>
//           <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
//         </div>

//         {/* Main Content Area */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           <Navbar 
//             onLogout={handleLogout}
//             sidebarCollapsed={sidebarCollapsed}
//             onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
//           />

//           <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fadeIn" key={pathname}>
//             <div className="max-w-7xl mx-auto w-full">
//               {children}
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;