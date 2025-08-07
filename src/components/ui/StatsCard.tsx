import React from 'react';
import { cn } from '@/lib/utils';
import Card from './Card';

type StatsCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  change?: string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  className?: string;
};

const variantClasses = {
  default: 'bg-blue-50 text-blue-800',
  success: 'bg-green-50 text-green-800',
  warning: 'bg-yellow-50 text-yellow-800',
  info: 'bg-cyan-50 text-cyan-800',
  danger: 'bg-red-50 text-red-800',
};

const changeColors = {
  default: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  info: 'text-cyan-600',
  danger: 'text-red-600',
};

export function StatsCard({
  title,
  value,
  change,
  icon,
  variant = 'default',
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-600">{value}</p>
          {change && (
            <p className={cn('text-xs mt-1', changeColors[variant])}>{change}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-full', variantClasses[variant])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
