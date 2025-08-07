'use client';

import AdminLayout from "../layout/AdminLayout";
import ClientPage from "../../pages/clientPage";

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <ClientPage />
    </AdminLayout>
  );
}
