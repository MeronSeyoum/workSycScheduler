import * as React from 'react';
import { cn } from '@/lib/cn';

// Generic factory for Card sections
function createCardSection<T extends HTMLElement>(
  displayName: string,
  baseClass: string
) {
  return React.forwardRef<T, React.HTMLAttributes<T>>(({ className, ...props }, ref) => (
    <div ref={ref as any} className={cn(baseClass, className)} {...props} />
  ));
}

const Card = createCardSection<HTMLDivElement>(
  'Card',
  // Softer off-white for light mode, slightly warmer gray in dark mode
  'rounded-lg border border-gray-300 bg-gray-50 text-gray-900 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
);

const CardHeader = createCardSection<HTMLDivElement>(
  'CardHeader',
  'flex flex-col space-y-1.5 p-6 border-b border-gray-200 dark:border-gray-700'
);

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight text-gray-800 dark:text-gray-100',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = createCardSection<HTMLDivElement>(
  'CardContent',
  'p-6 pt-4'
);

const CardFooter = createCardSection<HTMLDivElement>(
  'CardFooter',
  'flex items-center p-6 pt-4 border-t border-gray-200 dark:border-gray-700'
);

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
};
