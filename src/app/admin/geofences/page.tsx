'use client';

import GeofencePage from "@/app/pages/GeofencePage";
import AdminLayout from "../layout/AdminLayout";

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <GeofencePage />
    </AdminLayout>
  );
}
