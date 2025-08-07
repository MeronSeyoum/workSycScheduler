'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/app/admin/layout/Sidebar';
import Navbar from '@/app/admin/layout/Navbar';
import { useAuth } from '@/components/AuthProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
      <div className="fixed inset-0 flex items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-blue-500" />
      </div>
    );
  }
    // bg-[#f2f7f783]

  return (
    <div className="min-h-screen 
    ">
    
      {isNavigating && (
        <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
          <LoadingSpinner className="h-12 w-12 text-blue-500" />
          <span className="sr-only">Loading...</span>
        </div>
      )}

      <div className="flex h-screen">
        <Sidebar
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar 
            onLogout={handleLogout}
            sidebarCollapsed={sidebarCollapsed} 
          />

          <main className="flex-1 overflow-y-auto animate-fadeIn" key={pathname}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
 