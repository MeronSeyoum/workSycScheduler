import { Card, CardHeader, CardTitle, CardContent } from './AttendanceCard';
import { UserCheck, UserX, AlarmClock, Clock3 } from 'lucide-react';
import { Progress } from './progress';

interface AttendanceStatsProps {
  present: number;
  late: number;
  absent: number;
  earlyDepartures: number;
  totalEmployees?: number;
}

interface StatusColors {
  bg: string;
  text: string;
  icon: string;
  border: string;
}

interface StatusColorSet {
  present: StatusColors;
  late: StatusColors;
  absent: StatusColors;
  early: StatusColors;
}

export default function AttendanceStats({
  present,
  late,
  absent,
  earlyDepartures,
  totalEmployees
}: AttendanceStatsProps) {
  const calculatePercentage = (value: number): number => {
    if (!totalEmployees || totalEmployees === 0) return 0;
    return Math.round((value / totalEmployees) * 100);
  };

  // Colors for consistent theming with proper border colors
  const statusColors: StatusColorSet = {
    present: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      icon: 'text-green-500',
      border: 'border-green-500'
    },
    late: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      icon: 'text-yellow-500',
      border: 'border-yellow-500'
    },
    absent: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      icon: 'text-red-500',
      border: 'border-red-500'
    },
    early: { 
      bg: 'bg-orange-100', 
      text: 'text-orange-800', 
      icon: 'text-orange-500',
      border: 'border-orange-500'
    }
  };

  // Helper function to safely extract progress bar color
  const getProgressColor = (colorSet: StatusColors): string => {
    return colorSet.bg.replace('100', '500');
  };

  // Data for cards to avoid repetition
  const cardData = [
    {
      type: 'present' as const,
      title: 'Present',
      value: present,
      icon: UserCheck,
      description: 'Attendance Rate',
      colors: statusColors.present
    },
    {
      type: 'late' as const,
      title: 'Late Arrivals',
      value: late,
      icon: AlarmClock,
      description: 'Late Rate',
      colors: statusColors.late
    },
    {
      type: 'absent' as const,
      title: 'Absent',
      value: absent,
      icon: UserX,
      description: 'Absence Rate',
      colors: statusColors.absent
    },
    {
      type: 'early' as const,
      title: 'Early Departures',
      value: earlyDepartures,
      icon: Clock3,
      description: 'Early Rate',
      colors: statusColors.early
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card) => {
        const IconComponent = card.icon;
        const percentage = calculatePercentage(card.value);
        
        return (
          <Card 
            key={card.type}
            className={`border-l-4 ${card.colors.border} border-t-0 border-r-0 border-b-0 hover:shadow-md transition-shadow bg-white`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <IconComponent className={`h-5 w-5 ${card.colors.icon}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">
                {card.value}
              </div>
              {totalEmployees !== undefined && totalEmployees > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{card.description}</span>
                    <span>{percentage}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                    indicatorClassName={getProgressColor(card.colors)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}