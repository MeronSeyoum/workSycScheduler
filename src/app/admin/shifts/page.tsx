'use client';
import AdminLayout from '../layout/AdminLayout';
import ShiftSchedulerByLocation from '../../pages/ShiftSchedulerByLocation';

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <ShiftSchedulerByLocation />
    </AdminLayout>
  );
}
