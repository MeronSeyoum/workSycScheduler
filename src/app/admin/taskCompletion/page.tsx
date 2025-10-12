'use client';
import PhotosAndComplaints from "@/app/pages/PhotosAndComplaints";
import AdminLayout from "../layout/AdminLayout";

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <PhotosAndComplaints />
    </AdminLayout>
  );
}
