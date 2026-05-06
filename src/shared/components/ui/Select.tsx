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
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary-500"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            id={id}
            disabled={disabled || loading}
            className={cn(
              'flex h-10 w-full appearance-none rounded-xl border bg-surface px-3.5 pr-10 text-base sm:text-sm text-foreground shadow-sm',
              'transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10 hover:border-secondary-300',
              'disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:opacity-60',
              'overflow-hidden text-ellipsis whitespace-nowrap',
              error
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10'
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
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 group-hover:text-secondary-600 transition-colors">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
        {error && <p className="mt-1 text-xs font-medium text-danger-500">{error}</p>}
        {hint && !error && (
          <p className="mt-1 text-[11px] text-secondary-400 leading-tight">{hint}</p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
