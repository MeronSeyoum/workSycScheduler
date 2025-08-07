'use client';

import { useState } from 'react';
import { Download, FileText, Sheet } from 'lucide-react';
import  Button  from './Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { type ClockInOutLog } from '@/types/shift';

interface ExportMenuProps {
  logs?: ClockInOutLog[];
}

export function ExportMenu({ logs = [] }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['Employee', 'Clock-In', 'Clock-Out', 'Duration', 'Status', 'Location'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          `"${log.employeeName}"`,
          new Date(log.clockIn).toLocaleString(),
          log.clockOut ? new Date(log.clockOut).toLocaleString() : '--',
          log.duration ? `${Math.floor(log.duration / 60)}h ${log.duration % 60}m` : '--',
          log.status === 'active' ? 'On Duty' : 'Clocked Out',
          log.location ? `${log.location.lat.toFixed(4)}, ${log.location.lng.toFixed(4)}` : 'Remote'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `time-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    // In a real app, you would use a library like jsPDF or PDFKit
    console.log('PDF export would be implemented here');
    setTimeout(() => setIsExporting(false), 1000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" disabled={isExporting || logs.length === 0} className="gap-1 flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
          <Sheet className="mr-2 h-4 w-4" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}