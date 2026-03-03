import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/shared/utils';

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  value?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  className?: string;
};

export function SearchInput({
  value: controlledValue,
  onSearch,
  debounceMs = 300,
  placeholder = 'Tìm kiếm...',
  className,
  ...props
}: SearchInputProps) {
  const [internal, setInternal] = useState(controlledValue ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternal(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = (val: string) => {
    setInternal(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(val), debounceMs);
  };

  const handleClear = () => {
    setInternal('');
    onSearch('');
  };

  // Cleanup timer
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
      <input
        type="text"
        value={internal}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full rounded-lg border border-border bg-white pl-9 pr-8 text-sm text-foreground',
          'placeholder:text-secondary-400',
          'transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
        )}
        {...props}
      />
      {internal && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-secondary-400 hover:text-secondary-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
