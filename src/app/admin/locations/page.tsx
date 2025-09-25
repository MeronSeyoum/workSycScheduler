'use client';

import ClientManagementPage from "@/app/pages/ClientManagementPage";
import AdminLayout from "../layout/AdminLayout";

export default function AdminRootLayout() {
  return (
    <AdminLayout>
        <ClientManagementPage />
    </AdminLayout>
  );
}
