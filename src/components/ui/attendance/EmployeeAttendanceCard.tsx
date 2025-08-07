import Image from 'next/image';
import { Clock, MapPin, Smartphone, Mail } from 'lucide-react';
import Badge from './Badge';

interface EmployeeCardProps {
  employee: {
    id: number;
    name: string;
    position: string;
    status: 'active' | 'on_leave' | 'terminated' | 'inactive' | 'suspended';
    profileImageUrl?: string;
    phoneNumber?: string;
    email?: string;
    currentLocation?: string;
    lastClockIn?: string;
  };
}

export default function EmployeeAttendanceCard({ employee }: EmployeeCardProps) {
  const statusColors = {
    active: 'green',
    on_leave: 'blue',
    terminated: 'red',
    inactive: 'gray',
    suspended: 'yellow'
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 flex items-start space-x-4">
        <div className="relative h-16 w-16 rounded-full bg-gray-100 overflow-hidden">
          {employee.profileImageUrl ? (
            <Image
              src={employee.profileImageUrl}
              alt={employee.name}
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              {employee.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{employee.name}</h3>
              <p className="text-gray-500 text-sm">{employee.position}</p>
            </div>
            <Badge color={statusColors[employee.status]}>
              {employee.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {employee.phoneNumber && (
              <div className="flex items-center space-x-1 text-gray-600">
                <Smartphone className="h-4 w-4" />
                <span>{employee.phoneNumber}</span>
              </div>
            )}
            {employee.email && (
              <div className="flex items-center space-x-1 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{employee.email}</span>
              </div>
            )}
            {employee.currentLocation && (
              <div className="flex items-center space-x-1 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{employee.currentLocation}</span>
              </div>
            )}
            {employee.lastClockIn && (
              <div className="flex items-center space-x-1 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{employee.lastClockIn}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}