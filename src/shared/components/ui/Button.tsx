import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils';

const variants = {
  primary:
    'bg-accent-400 text-white hover:bg-accent-500 focus-visible:ring-accent-400',
  secondary:
    'bg-white text-secondary-700 border border-border hover:bg-secondary-50 focus-visible:ring-secondary-400',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 focus-visible:ring-danger-400',
  ghost:
    'text-secondary-600 hover:bg-secondary-100 focus-visible:ring-secondary-400',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-6 text-sm gap-2 rounded-lg',
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconRight: IconRight,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          Icon && <Icon className="h-4 w-4" />
        )}
        {children}
        {IconRight && !loading && <IconRight className="h-4 w-4" />}
      </button>
    );
  },
);

Button.displayName = 'Button';
