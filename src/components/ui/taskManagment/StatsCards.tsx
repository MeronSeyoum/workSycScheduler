'use client';

import React from 'react';

interface StatsCardsProps {
  pendingShifts: number;
  activeComplaints: number;
  totalPhotos: number;
  activeClients: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  pendingShifts,
  activeComplaints,
  totalPhotos,
  activeClients,
}) => {
  const stats = [
    {
      count: pendingShifts,
      label: 'Pending Shifts',
      gradient: 'from-yellow-400 to-yellow-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      count: activeComplaints,
      label: 'Active Complaints',
      gradient: 'from-red-500 to-red-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      count: totalPhotos,
      label: 'Total Photos',
      gradient: 'from-purple-500 to-purple-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      count: activeClients,
      label: 'Active Clients',
      gradient: 'from-orange-500 to-orange-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 text-white shadow-lg`}>
          <div className="flex justify-between items-start mb-3">
            <p className="text-3xl font-bold mb-1">{stat.count}</p>
            <div className="bg-white/20 rounded-lg p-2">
              {stat.icon}
            </div>
          </div>
          <p className="text-sm font-medium opacity-90">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;