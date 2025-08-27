'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/app/admin/layout/Sidebar';
import Navbar from '@/app/admin/layout/Navbar';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingSpinner from '@/components/ui/common/LoadingSpinner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { user, isLoading, logout } = useAuth();

  // Handle auth state and redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

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

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <LoadingSpinner className="h-12 w-12 text-teal-700" />
      </div>
    );
  }

  return (
   <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-130 relative overflow-hidden">
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
        {/* Desktop Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out hidden lg:block`}>
          <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar 
            onLogout={handleLogout}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fadeIn" key={pathname}>
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;