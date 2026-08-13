import { CalendarDays } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { vi } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { cn } from '@/shared/utils';

interface DateInputProps {
  value: string; // YYYY-MM-DD or ''
  onChange: (value: string) => void;
  className?: string;
  min?: string;
  max?: string;
}

type PopupPosition = {
  left: number;
  top: number;
};

function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined;

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return value;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

/** Date picker that always displays dd/MM/yyyy and does not expose browser locale formatting. */
export function DateInput({ value, onChange, className, min, max }: DateInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);

  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const minDate = useMemo(() => parseIsoDate(min), [min]);
  const maxDate = useMemo(() => parseIsoDate(max), [max]);

  const displayValue = value
    ? formatDisplayDate(value)
    : '';

  const updatePopupPosition = () => {
    const trigger = wrapperRef.current?.getBoundingClientRect();
    if (!trigger) return;

    const popup = popupRef.current;
    const gutter = 8;
    const viewportPadding = 12;
    const popupWidth = Math.min(
      popup?.offsetWidth ?? 320,
      window.innerWidth - viewportPadding * 2,
    );
    const popupHeight = Math.min(
      popup?.offsetHeight ?? 360,
      window.innerHeight - viewportPadding * 2,
    );
    const spaceBelow = window.innerHeight - trigger.bottom - viewportPadding;
    const openAbove = spaceBelow < popupHeight && trigger.top > popupHeight;

    setPopupPosition({
      left: Math.min(
        Math.max(trigger.left, viewportPadding),
        window.innerWidth - popupWidth - viewportPadding,
      ),
      top: openAbove
        ? Math.max(trigger.top - popupHeight - gutter, viewportPadding)
        : Math.min(trigger.bottom + gutter, window.innerHeight - popupHeight - viewportPadding),
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPopupPosition(null);
      return;
    }

    updatePopupPosition();
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !wrapperRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePopupPosition);
    window.addEventListener('scroll', updatePopupPosition, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePopupPosition);
      window.removeEventListener('scroll', updatePopupPosition, true);
    };
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'relative w-full',
      )}
    >
      <button
        type="button"
        className={cn(
          'relative flex h-10 w-full cursor-pointer items-center rounded-xl border border-border bg-surface pl-9 pr-3 text-left text-sm font-medium transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10',
          className,
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
        <span className={cn('flex-1 select-none', displayValue ? '!text-secondary-950' : 'text-secondary-400')}>
          {displayValue || 'dd/MM/yyyy'}
        </span>
      </button>

      {open && popupPosition ? createPortal(
        <div
          ref={popupRef}
          className="fixed z-popover max-h-[calc(100vh-24px)] w-[min(20rem,calc(100vw-24px))] overflow-auto rounded-xl border border-border bg-white p-3 shadow-xl"
          style={{
            left: popupPosition.left,
            top: popupPosition.top,
          }}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate ?? minDate ?? new Date()}
            locale={vi}
            weekStartsOn={1}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            onSelect={(date) => {
              if (!date) return;
              onChange(toIsoDate(date));
              setOpen(false);
            }}
            style={{
              '--rdp-accent-color': '#2563eb',
              '--rdp-accent-background-color': '#dbeafe',
              '--rdp-day_button-width': '2.25rem',
              '--rdp-day_button-height': '2.25rem',
            } as CSSProperties}
          />
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
