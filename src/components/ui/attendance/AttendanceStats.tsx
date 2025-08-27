import { Card, CardHeader, CardTitle, CardContent } from './AttendanceCard';
import { Clock, UserCheck, UserX, AlarmClock, Calendar, TrendingUp, Clock3 } from 'lucide-react';
import { Progress } from './progress';

interface AttendanceStatsProps {
  present: number;
  late: number;
  absent: number;
  earlyDepartures: number;
  totalEmployees?: number;
}

export default function AttendanceStats({
  present,
  late,
  absent,
  earlyDepartures,
  totalEmployees
}: AttendanceStatsProps) {
  const calculatePercentage = (value: number) => {
    if (!totalEmployees || totalEmployees === 0) return 0;
    return Math.round((value / totalEmployees) * 100);
  };

  // Colors for consistent theming
  const statusColors = {
    present: { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-500' },
    late: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'text-yellow-500' },
    absent: { bg: 'bg-red-100', text: 'text-red-800', icon: 'text-red-500' },
    early: { bg: 'bg-orange-100', text: 'text-orange-800', icon: 'text-orange-500' }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
      {/* Present Card */}
      <Card className="border-l-4 border-green-500 hover:shadow-md transition-shadow bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-600">Present</CardTitle>
          <UserCheck className={`h-5 w-5 ${statusColors.present.icon}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-800">{present}</div>
          {totalEmployees && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Attendance Rate</span>
                <span>{calculatePercentage(present)}%</span>
              </div>
              <Progress
                value={calculatePercentage(present)}
                className="h-2"
                indicatorClassName={statusColors.present.bg.replace('100', '500')}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Late Card */}
      <Card className="border-l-4 border-yellow-500 hover:shadow-md transition-shadow bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-600">Late Arrivals</CardTitle>
          <AlarmClock className={`h-5 w-5 ${statusColors.late.icon}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-800">{late}</div>
          {totalEmployees && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Late Rate</span>
                <span>{calculatePercentage(late)}%</span>
              </div>
              <Progress
                value={calculatePercentage(late)}
                className="h-2"
                indicatorClassName={statusColors.late.bg.replace('100', '500')}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Absent Card */}
      <Card className="border-l-4 border-red-500 hover:shadow-md transition-shadow bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-600">Absent</CardTitle>
          <UserX className={`h-5 w-5 ${statusColors.absent.icon}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-800">{absent}</div>
          {totalEmployees && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Absence Rate</span>
                <span>{calculatePercentage(absent)}%</span>
              </div>
              <Progress
                value={calculatePercentage(absent)}
                className="h-2"
                indicatorClassName={statusColors.absent.bg.replace('100', '500')}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Early Departures Card */}
      <Card className="border-l-4 border-orange-500 hover:shadow-md transition-shadow bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-600">Early Departures</CardTitle>
          <Clock3 className={`h-5 w-5 ${statusColors.early.icon}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-800">{earlyDepartures}</div>
          {totalEmployees && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Early Rate</span>
                <span>{calculatePercentage(earlyDepartures)}%</span>
              </div>
              <Progress
                value={calculatePercentage(earlyDepartures)}
                className="h-2"
                indicatorClassName={statusColors.early.bg.replace('100', '500')}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}