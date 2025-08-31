import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../common/Table';
import { Badge } from '@/components/ui/common/badge';
import { Clock, MapPin, User, Calendar, Check, X, Clock as ClockIcon } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { AttendanceRecord } from '@/lib/types/attendance';

interface RecentAttendanceTableProps {
  data: AttendanceRecord[];
}

export default function RecentAttendanceTable({ data = [] }: RecentAttendanceTableProps) {
  const safeFormat = (dateString: string, formatString: string) => {
    try {
      return format(new Date(dateString), formatString);
    } catch {
      return 'Invalid date';
    }
  };

  // Sort data by date in descending order (newest first)
  const sortedData = [...data].sort((a, b) => {
    try {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order (newest first)
    } catch {
      return 0; // If date parsing fails, maintain original order
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': 
      case 'present': 
        return <Badge variant="success"><Check className="h-3 w-3 mr-1" /> Present</Badge>;
      case 'late': 
      case 'late_arrival': 
        return <Badge variant="warning"><ClockIcon className="h-3 w-3 mr-1" /> Late</Badge>;
      case 'absent': 
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Absent</Badge>;
      case 'early': 
      case 'early_departure': 
        return <Badge variant="secondary"><ClockIcon className="h-3 w-3 mr-1" /> Early</Badge>;
      case 'on_leave': 
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">On Leave</Badge>;
      case 'partial_attendance': 
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Partial</Badge>;
      default: 
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'geofence': return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'qrcode': return <Check className="h-4 w-4 text-green-500" />;
      case 'manual': return <User className="h-4 w-4 text-orange-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'NA';
    return name.split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Table className='bg-white'>
      <TableHeader>
        <TableRow className='bg-gray-100 border border-gray-200'>
          <TableHead>Employee</TableHead>
          <TableHead className="whitespace-nowrap">Date</TableHead>
          <TableHead className="whitespace-nowrap">Clock In</TableHead>
          <TableHead className="whitespace-nowrap">Clock Out</TableHead>
          <TableHead className="whitespace-nowrap">Hours</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Method</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.length > 0 ? sortedData.map((record) => (
          <TableRow key={record.id} className='border border-gray-200'>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-100 text-sm">
                  {getInitials(record.employeeName)}
                </div>
                <div>
                  <div className='font-medium text-sm'>{record.employeeName}</div>
                  <div className="text-xs text-gray-500">{record.employeeCode}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {safeFormat(record.date, 'MMM d, yyyy')}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {safeFormat(record.clockIn, 'HH:mm')}
                <span className="text-xs text-muted-foreground">
                  ({formatDistanceToNow(new Date(record.clockIn), { addSuffix: true })})
                </span>
              </div>
            </TableCell>
            <TableCell>
              {record.clockOut ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {safeFormat(record.clockOut, 'HH:mm')}
                </div>
              ) : <span className="text-muted-foreground">-</span>}
            </TableCell>
            <TableCell>
              {record.hoursWorked ? `${record.hoursWorked.toFixed(1)}h` : '-'}
            </TableCell>
            <TableCell>{getStatusBadge(record.status)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {record.location}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getMethodIcon(record.method)}
                <span className="capitalize">{record.method}</span>
              </div>
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={8} className="h-24 text-center">
              No recent attendance records found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}