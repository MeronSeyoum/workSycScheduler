'use client';

import AttendancePage from "@/app/pages/AttendancePage";
import AdminLayout from "../layout/AdminLayout";

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <AttendancePage />
    </AdminLayout>
  );
}
