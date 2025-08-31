import React from "react";

// Define types for our component props
export interface StatCardProps {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  change?: number;
  secondaryValue?: string | number;
  secondaryLabel?: string;
  bgColor?: string;
  // Completion rate specific props
  completionRate?: {
    completed: number;
    total: number;
    prevCompleted: number;
  };
  // Custom content slot
  customContent?: React.ReactNode;
}

// Completion Rate Icon Component
const CompletionRateIcon: React.FC<{ completed: number; total: number }> = ({
  completed,
  total,
}) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <div className="relative w-12 h-12">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          className="text-gray-200 stroke-current"
          strokeWidth="3"
          fill="none"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="text-teal-600 stroke-current"
          strokeWidth="3"
          strokeDasharray={`${percentage}, 100`}
          fill="none"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-teal-700">
        {Math.round(percentage)}%
      </div>
    </div>
  );
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change = 0,
  secondaryValue,
  secondaryLabel,
  bgColor = "bg-white",
  completionRate,
  customContent,
}) => {
  // If completionRate is provided, render the completion rate version
  if (completionRate) {
    const { completed, total, prevCompleted } = completionRate;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const changeFromPrev = completed - prevCompleted;
    
    return (
      <div className={`p-4 rounded-lg shadow ${bgColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1 text-teal-700">
              {percentage}%
            </p>
          </div>
          <CompletionRateIcon completed={completed} total={total} />
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {completed} of {total} shifts
          {prevCompleted > 0 && (
            <span
              className={`ml-2 ${
                changeFromPrev > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              ({changeFromPrev > 0 ? "+" : ""}
              {changeFromPrev} from previous period)
            </span>
          )}
        </div>
      </div>
    );
  }

  // If custom content is provided, render it
  if (customContent) {
    return (
      <div className={`p-4 rounded-lg shadow ${bgColor}`}>
        {customContent}
      </div>
    );
  }

  // Render the standard stat card
  return (
    <div className={`p-4 rounded-lg shadow ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1 text-slate-900">{value}</p>
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${bgColor.replace('bg-', 'bg-').split(' ')[0] || 'bg-gray-100'}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 text-sm text-gray-500">
        {change !== 0 && (
          <span className={change > 0 ? "text-green-500" : "text-red-500"}>
            {change > 0 ? "↑" : "↓"} {Math.abs(change)} from last period
          </span>
        )}
        {secondaryValue && secondaryLabel && (
          <div>
            {secondaryLabel}: {secondaryValue}
          </div>
        )}
      </div>
    </div>
  );
};
