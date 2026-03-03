import { forwardRef, type TextareaHTMLAttributes, useId } from 'react';
import { cn } from '@/shared/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          ref={ref}
          id={id}
          rows={4}
          className={cn(
            'flex w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground',
            'placeholder:text-secondary-400 resize-y',
            'transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
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

Textarea.displayName = 'Textarea';
