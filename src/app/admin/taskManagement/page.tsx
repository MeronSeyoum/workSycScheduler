'use client';
import PhotosAndComplaints from "@/app/pages/TaskManagment";
import AdminLayout from "../layout/AdminLayout";

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <PhotosAndComplaints />
    </AdminLayout>
  );
}
