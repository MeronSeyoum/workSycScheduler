// DashboardStats.tsx
import React from "react";
import { AlertCircle, CheckCircle, Clock, Settings, Users } from "lucide-react";

interface StatsData {
  totalShifts: number;
  nightShifts: number;
  avgHours: number;
  balanceScore: number;
  conflicts: number;
}

interface DashboardStatsProps {
  stats: StatsData;
  show?: boolean; // Optional prop to control visibility
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  stats, 
  show = true // Default to true for backward compatibility
}) => {
  // Format the average hours to one decimal place
  const formattedAvgHours = typeof stats.avgHours === 'number' 
    ? stats.avgHours.toFixed(1) 
    : '0.0';

  // Return null if show is false
  if (!show) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded shadow-sm p-5 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Users className="text-blue-600" size={20} />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Total Shifts</span>
            <p className="text-2xl font-bold text-gray-900">
              {typeof stats.totalShifts === 'number' ? stats.totalShifts : 0}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded shadow-sm p-5 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50">
            <Clock className="text-purple-600" size={20} />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Night Shifts</span>
            <p className="text-2xl font-bold text-gray-900">
              {typeof stats.nightShifts === 'number' ? stats.nightShifts : 0}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded shadow-sm p-5 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Avg Hours</span>
            <p className="text-2xl font-bold text-gray-900">{formattedAvgHours}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded shadow-sm p-5 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-50">
            <Settings className="text-orange-600" size={20} />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Balance Score</span>
            <p className="text-2xl font-bold text-gray-900">
              {typeof stats.balanceScore === 'number' ? stats.balanceScore : 0}%
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded shadow-sm p-5 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50">
            <AlertCircle className="text-red-600" size={20} />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Conflicts</span>
            <p className="text-2xl font-bold text-gray-900">
              {typeof stats.conflicts === 'number' ? stats.conflicts : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};