import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  fullPage?: boolean;
};

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
} as const;

export function LoadingSpinner({
  size = 'md',
  label = 'Đang tải...',
  className,
  fullPage = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary-500', sizeClasses[size])} />
      {label && <p className="text-sm text-secondary-400">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
