'use client';
import AdminLayout from "../layout/AdminLayout";
import UserManagementPage from "@/app/pages/userManagmentPage";

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <UserManagementPage />
    </AdminLayout>
  );
}
