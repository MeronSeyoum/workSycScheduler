'use client';

import AdminDashboard from "@/app/pages/AdminDashboard";
import AdminLayout from "../layout/AdminLayout";

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
