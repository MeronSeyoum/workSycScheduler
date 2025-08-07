import React from 'react';
import { cn } from '@/lib/utils'; // Optional utility to join class names

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export default function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-sm font-medium text-gray-700', className)}
      {...props}
    >
      {children}
    </label>
  );
}
