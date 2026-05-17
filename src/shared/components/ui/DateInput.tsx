import { CalendarDays } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/shared/utils';

interface DateInputProps {
  value: string; // YYYY-MM-DD or ''
  onChange: (value: string) => void;
  className?: string;
  min?: string;
  max?: string;
}

/** Date input that always displays the value in dd/MM/yyyy format. */
export function DateInput({ value, onChange, className, min, max }: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = value
    ? value.split('-').reverse().join('/')
    : '';

  return (
    <div
      className={cn(
        'relative flex h-10 w-full cursor-pointer items-center rounded-xl border border-border bg-surface pl-9 pr-3 text-sm font-medium transition-all focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/10',
        className,
      )}
      onClick={() => inputRef.current?.showPicker?.()}
    >
      <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400 pointer-events-none" />
      <span className={cn('flex-1 select-none', displayValue ? '!text-secondary-950' : 'text-secondary-400')}>
        {displayValue || 'dd/MM/yyyy'}
      </span>
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
