import type { ReactNode } from 'react';
import { cn } from '@/shared/utils';

type PageWrapperProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Consistent page padding and max-width wrapper.
 * Use inside a route element rendered within `<MainLayout />`.
 */
export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6', className)}>
      {children}
    </div>
  );
}
