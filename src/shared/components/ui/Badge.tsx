import { cn } from '@/shared/utils';

const badgeVariants = {
  // Room types
  VIP: 'bg-amber-100 text-amber-700 border-amber-200',
  STANDARD: 'bg-teal-100 text-teal-700 border-teal-200',
  NORMAL: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PREMIUM: 'bg-purple-100 text-purple-700 border-purple-200',

  // Status
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  danger: 'bg-danger-50 text-danger-700 border-danger-200',
  info: 'bg-info-50 text-info-700 border-info-200',
  neutral: 'bg-secondary-100 text-secondary-600 border-secondary-200',
} as const;

type BadgeProps = {
  variant?: keyof typeof badgeVariants;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
};

export function Badge({
  variant = 'neutral',
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className,
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
