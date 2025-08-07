'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  MapPin,
  Settings,
  ClipboardList,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  QrCode
} from 'lucide-react';
import { MdAccountCircle, MdManageAccounts } from 'react-icons/md';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Logo from "@/components/ui/logo"
const navItems = [
  { href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
  { href: '/admin/employees', icon: <Users className="h-5 w-5" />, label: 'Employees' },
  { href: '/admin/clients', icon: <MdManageAccounts className="h-5 w-5" />, label: 'Clients' },
  { href: '/admin/geofences', icon: <MapPin className="h-5 w-5" />, label: 'Geofences' },
  { href: '/admin/qrcode', icon: <QrCode className="h-5 w-5" />, label: 'QR Codes' },
  { href: '/admin/shifts', icon: <Calendar className="h-5 w-5" />, label: 'Scheduling' },
  { href: '/admin/attendance', icon: <Clock className="h-5 w-5" />, label: 'Attendance' },
  { href: '/admin/users', icon: <MdAccountCircle className="h-5 w-5" />, label: 'User Management' },
  { href: '/admin/reports/time', icon: <Clock className="h-5 w-5" />, label: 'Time Reports' },
  { href: '/admin/reports/attendance', icon: <ClipboardList className="h-5 w-5" />, label: 'Attendance' },
  { href: '/admin/reports/export', icon: <FileSpreadsheet className="h-5 w-5" />, label: 'Data Export' },
  { href: '/admin/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' }
];

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
   <div className={cn(
      "bg-[#e5f0F0] text-slate-900 shadow-md sticky top-0 h-screen",
      "flex flex-col transition-all duration-300 ease-in-out",
      "z-20 select-none",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-400">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2">
           <Logo />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-slate-100 transition rounded-full border border-slate-300"
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center p-3 rounded-lg text-sm gap-3 hover:bg-slate-400 transition',
                  isActive(item.href)
                    ? 'bg-teal-700 text-white font-medium '
                    : 'text-slate-700',
                  collapsed && 'justify-center'
                )}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white font-medium">
            JD
          </div>
          <div>
            <div className="font-medium">Meron Seyoum</div>
            <div className="text-xs text-slate-500">Admin</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
