'use client';

import LocationPage from "@/app/pages/locationPage";
import AdminLayout from "../layout/AdminLayout";

export default function AdminRootLayout() {
  return (
    <AdminLayout>
        <LocationPage />
    </AdminLayout>
  );
}
