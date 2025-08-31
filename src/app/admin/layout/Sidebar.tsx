'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  MapPin,
  ClipboardList,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  QrCode,
} from 'lucide-react';
import { MdAccountCircle, MdManageAccounts } from 'react-icons/md';
import { cn } from '@/lib/utils';

// Top navigation items
const topNavItems = [
  { href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
  { href: '/admin/employees', icon: <Users className="h-5 w-5" />, label: 'Employees' },
  { href: '/admin/clients', icon: <MdManageAccounts className="h-5 w-5" />, label: 'Clients' },
  { href: '/admin/geofences', icon: <MapPin className="h-5 w-5" />, label: 'Geofences' },
  { href: '/admin/qrcode', icon: <QrCode className="h-5 w-5" />, label: 'QR Codes' },
  { href: '/admin/shifts', icon: <Calendar className="h-5 w-5" />, label: 'Scheduling' },
  { href: '/admin/attendance', icon: <Clock className="h-5 w-5" />, label: 'Attendance' },
  { href: '/admin/users', icon: <MdAccountCircle className="h-5 w-5" />, label: 'User Management' },
];

// Reports section
const reportsNavItems = [
  { href: '/admin/reports/time', icon: <Clock className="h-5 w-5" />, label: 'Time Reports' },
  { href: '/admin/reports/attendance', icon: <ClipboardList className="h-5 w-5" />, label: 'Attendance' },
  { href: '/admin/reports/export', icon: <FileSpreadsheet className="h-5 w-5" />, label: 'Data Export' },
];

// // Bottom navigation items
// const bottomNavItems = [
//   { href: '/admin/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
//   { href: '/admin/notifications', icon: <Bell className="h-5 w-5" />, label: 'Notifications', badge: 3 },
//   { href: '/admin/support', icon: <HelpCircle className="h-5 w-5" />, label: 'Support' },
// ];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div
      className={cn(
        'bg-white text-slate-900 shadow-md h-screen fixed top-0 left-0 z-30 transition-all duration-300 ease-in-out flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4.25 border-b border-gray-300">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="bg-teal-700 p-1 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-teal-800">WorkSync</h2>
          </Link>
        )}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="p-1 hover:bg-teal-100 transition rounded-full border border-teal-300 text-teal-700"
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* <div className="px-3 mb-4">
          {!collapsed && <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">Main</p>}
        </div> */}
        <ul className="space-y-1 px-2">
          {topNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center p-3 rounded-lg text-sm gap-3 hover:bg-teal-50 transition border border-transparent hover:border-teal-200',
                  isActive(item.href)
                    ? 'bg-teal-100 text-teal-700 font-medium border-gray-300'
                    : 'text-slate-700',
                  collapsed && 'justify-center'
                )}
              >
                {React.cloneElement(item.icon, {
                  className: cn(
                    "h-5 w-5",
                    isActive(item.href) ? "text-teal-700" : "text-teal-600"
                  )
                })}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* Reports Section */}
        <div className="px-3 mt-6 mb-4">
          {!collapsed && <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">Reports</p>}
        </div>
        <ul className="space-y-1 px-2">
          {reportsNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center p-3 rounded-lg text-sm gap-3 hover:bg-teal-50 transition border border-transparent hover:border-teal-200',
                  isActive(item.href)
                    ? 'bg-teal-100 text-teal-700 font-medium border-teal-300'
                    : 'text-slate-700',
                  collapsed && 'justify-center'
                )}
              >
                {React.cloneElement(item.icon, {
                  className: cn(
                    "h-5 w-5",
                    isActive(item.href) ? "text-teal-700" : "text-teal-600"
                  )
                })}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation
      <div className="border-t border-teal-200 pt-2 pb-4">
        <ul className="space-y-1 px-2">
          {bottomNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center p-3 rounded-lg text-sm gap-3 hover:bg-teal-50 transition relative border border-transparent hover:border-teal-200',
                  isActive(item.href)
                    ? 'bg-teal-100 text-teal-700 font-medium border-teal-300'
                    : 'text-slate-700',
                  collapsed && 'justify-center'
                )}
              >
                {React.cloneElement(item.icon, {
                  className: cn(
                    "h-5 w-5",
                    isActive(item.href) ? "text-teal-700" : "text-teal-600"
                  )
                })}
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-teal-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-1 right-1 bg-teal-700 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul> 

       
      </div>*/}
    </div>
  );
};

export default Sidebar;