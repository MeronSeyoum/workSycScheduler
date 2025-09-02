'use client';
import AdminLayout from '../layout/AdminLayout';
import SchedulerPage from '../../pages/SchedulerPage';

export default function AdminRootLayout() {
  return (
    <AdminLayout>
      <SchedulerPage />
    </AdminLayout>
  );
}


// Export all scheduler components for easy importing
// export { AISchedulerModal } from './AISchedulerModal';
// export { OpenShiftsModal } from './OpenShiftsModal';
// export { ShiftSwapsModal } from './ShiftSwapsModal';
// export { ShiftCard } from './ShiftCard';
// export { EmptyShiftCell } from './EmptyShiftCell';
// export { ScheduleHeader } from './ScheduleHeader';
// export { ScheduleFilters } from './ScheduleFilters';
// export { ComplianceWarnings } from './ComplianceWarnings';
// export { ScheduleGrid } from './ScheduleGrid';
// export { EditShiftTimeModal } from './EditShiftTimeModal';

// // Re-export the main scheduler page
// export { default as SchedulerPage } from './SchedulerPage';



