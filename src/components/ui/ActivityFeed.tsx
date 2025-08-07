import React from 'react';

type Activity = {
  id: number;
  user: string;
  action: string;
  time: string;
};

type ActivityFeedProps = {
  activities: Activity[];
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4 p-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {activity.user} <span className="text-gray-500 font-normal">{activity.action}</span>
            </p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
      {activities.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
      )}
    </div>
  );
}