'use client';
import EmployeeScheduleAIForm from '@/app/pages/EmployeeScheduleAIForm';
import AdminLayout from '../layout/AdminLayout';

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <EmployeeScheduleAIForm />
    </AdminLayout>
  );
}