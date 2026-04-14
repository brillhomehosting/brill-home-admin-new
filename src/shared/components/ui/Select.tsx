import { forwardRef, type SelectHTMLAttributes, useId } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  loading?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, hint, options, placeholder, loading, id: idProp, disabled, ...props },
    ref,
  ) => {
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
        <div className="relative">
          <select
            ref={ref}
            id={id}
            disabled={disabled || loading}
            className={cn(
              'flex h-9 w-full appearance-none rounded-lg border bg-white px-3 pr-8 text-sm text-foreground',
              'transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
              'disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:opacity-60',
              error
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
                : 'border-border',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-400">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
        {hint && !error && (
          <p className="mt-1 text-xs text-secondary-400">{hint}</p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
