import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/shared/utils';

type EmptyStateProps = {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title = 'Không có dữ liệu',
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-100">
        {icon ?? <Inbox className="h-7 w-7 text-secondary-400" />}
      </div>
      <h3 className="text-base font-semibold text-secondary-700">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-secondary-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
