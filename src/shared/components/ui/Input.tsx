import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { cn } from '@/shared/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id: idProp, ...props }, ref) => {
    const autoId = useId();
    const id = idProp ?? autoId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-secondary-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'flex h-10 w-full rounded-xl border bg-surface px-3.5 text-base sm:text-sm text-foreground shadow-sm',
            'placeholder:text-secondary-400',
            'transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10 hover:border-secondary-300',
            'disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:opacity-60',
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-border',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
        {hint && !error && (
          <p className="mt-1 text-xs text-secondary-400">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
