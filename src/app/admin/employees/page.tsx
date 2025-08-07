'use client';
import EmployeesPage from '@/app/pages/EmployeePage';
import AdminLayout from '../layout/AdminLayout';

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <EmployeesPage />
    </AdminLayout>
  );
}
