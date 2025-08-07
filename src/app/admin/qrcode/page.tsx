'use client';

import AdminLayout from "../layout/AdminLayout";
import QRCodePage from "@/app/pages/QRCodePage";

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <QRCodePage />
    </AdminLayout>
  );
}
