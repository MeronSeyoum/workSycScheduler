'use client';
import UserProfilePage from "@/app/pages/UserProfilePage";
import AdminLayout from "../layout/AdminLayout";

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <UserProfilePage />
    </AdminLayout>
  );
}
