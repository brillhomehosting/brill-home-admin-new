import { DateInput } from '@/shared/components/ui/DateInput';
import type { Holiday } from '@/shared/types';
import { cn, formatCurrency } from '@/shared/utils';
import {
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useHolidaysAll } from '../hooks/useHolidays';

// ── Date helpers ─────────────────────────────────────────────────────────────

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toLocalDate(isoStr: string): Date {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function buildDayList(startIso: string, endIso: string): Date[] {
  const days: Date[] = [];
  const cursor = toLocalDate(startIso);
  const end = toLocalDate(endIso);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/**
 * Parse a holiday's startDay/endDay strings into concrete Date instances
 * that overlap with the given range. Returns zero or more occurrences
 * (ANNUAL holidays may appear in multiple years if the range spans them).
 *
 * Formats:
 *   ANNUAL       → "dd/MM"       e.g. "25/12"
 *   SPECIFIC_YEAR → "dd/MM/yyyy"  e.g. "30/04/2025"
 */
function projectHoliday(
  holiday: Holiday,
  rangeStart: Date,
  rangeEnd: Date,
): Array<{ holiday: Holiday; start: Date; end: Date }> {
  if (holiday.holidayType === 'SPECIFIC_YEAR') {
    const parse = (s: string) => {
      const [d, m, y] = s.split('/').map(Number);
      return new Date(y, m - 1, d);
    };
    const start = parse(holiday.startDay);
    const end = parse(holiday.endDay);
    if (end < rangeStart || start > rangeEnd) return [];
    return [{ holiday, start, end }];
  }

  // ANNUAL: project onto every year that intersects the range
  const [sd, sm] = holiday.startDay.split('/').map(Number);
  const [ed, em] = holiday.endDay.split('/').map(Number);

  const results: Array<{ holiday: Holiday; start: Date; end: Date }> = [];
  const fromYear = rangeStart.getFullYear();
  const toYear = rangeEnd.getFullYear();

  for (let year = fromYear; year <= toYear; year++) {
    let start = new Date(year, sm - 1, sd);
    let end = new Date(year, em - 1, ed);
    // Year wrap: e.g. Dec 30 – Jan 2
    if (end < start) end = new Date(year + 1, em - 1, ed);
    if (end >= rangeStart && start <= rangeEnd) {
      results.push({ holiday, start, end });
    }
  }
  return results;
}

// ── Visual config ─────────────────────────────────────────────────────────────

const barColor: Record<string, string> = {
  ANNUAL: 'bg-blue-500 hover:bg-blue-600',
  SPECIFIC_YEAR: 'bg-emerald-500 hover:bg-emerald-600',
};

const badgeColor: Record<string, string> = {
  ANNUAL: 'bg-blue-50 text-blue-700 border border-blue-200',
  SPECIFIC_YEAR: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onEdit: (holiday: Holiday) => void;
}

export function HolidayCalendarSection({ onEdit }: Props) {
  const now = new Date();
  const defaultStart = toIso(new Date(now.getFullYear(), now.getMonth(), 1));
  const defaultEnd = toIso(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const [rangeStart, setRangeStart] = useState(defaultStart);
  const [rangeEnd, setRangeEnd] = useState(defaultEnd);
  const [collapsed, setCollapsed] = useState(false);

  const isValidRange = rangeStart && rangeEnd && rangeStart <= rangeEnd;

  const { data: allHolidays = [], isLoading } = useHolidaysAll();

  const days = useMemo(
    () => (isValidRange ? buildDayList(rangeStart, rangeEnd).slice(0, 366) : []),
    [rangeStart, rangeEnd, isValidRange],
  );
  const totalDays = days.length;
  const today = toIso(now);

  // Project all holidays onto the current range
  const projected = useMemo(() => {
    if (!isValidRange || totalDays === 0) return [];
    const rangeStartDate = toLocalDate(rangeStart);
    const rangeEndDate = toLocalDate(rangeEnd);
    return allHolidays.flatMap((h) => projectHoliday(h, rangeStartDate, rangeEndDate));
  }, [allHolidays, rangeStart, rangeEnd, isValidRange, totalDays]);

  function jumpPrevMonth() {
    const ref = toLocalDate(rangeStart);
    setRangeStart(toIso(new Date(ref.getFullYear(), ref.getMonth() - 1, 1)));
    setRangeEnd(toIso(new Date(ref.getFullYear(), ref.getMonth(), 0)));
  }

  function jumpNextMonth() {
    const ref = toLocalDate(rangeStart);
    setRangeStart(toIso(new Date(ref.getFullYear(), ref.getMonth() + 1, 1)));
    setRangeEnd(toIso(new Date(ref.getFullYear(), ref.getMonth() + 2, 0)));
  }

  function jumpCurrentMonth() {
    setRangeStart(defaultStart);
    setRangeEnd(defaultEnd);
  }

  function getBarGeometry(start: Date, end: Date) {
    const startIso = toIso(start < toLocalDate(rangeStart) ? toLocalDate(rangeStart) : start);
    const endIso = toIso(end > toLocalDate(rangeEnd) ? toLocalDate(rangeEnd) : end);
    const offsetDays = days.findIndex((d) => toIso(d) === startIso);
    if (offsetDays === -1) return null;
    const spanDays =
      Math.round(
        (toLocalDate(endIso).getTime() - toLocalDate(startIso).getTime()) / 86_400_000,
      ) + 1;
    return { offsetDays, spanDays };
  }

  function surchargeLabel(h: Holiday) {
    return h.surchargeType === 'AMOUNT'
      ? `+${formatCurrency(h.surchargeAmount)}`
      : `+${h.surchargePercent}%`;
  }

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-surface/50 border-b border-border">
        <div className="flex items-center gap-2 shrink-0">
          <CalendarRange className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-bold text-foreground">Lịch ngày lễ</span>
        </div>

        {/* Month jump */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={jumpPrevMonth}
            className="p-1.5 rounded-lg hover:bg-secondary-100 text-secondary-500 hover:text-foreground transition-colors"
            title="Tháng trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={jumpCurrentMonth}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border hover:bg-secondary-100 text-secondary-600 hover:text-foreground transition-colors"
          >
            Tháng này
          </button>
          <button
            onClick={jumpNextMonth}
            className="p-1.5 rounded-lg hover:bg-secondary-100 text-secondary-500 hover:text-foreground transition-colors"
            title="Tháng sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Date range pickers */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none sm:w-36">
            <span className="text-xs text-secondary-400 shrink-0">Từ</span>
            <DateInput value={rangeStart} onChange={setRangeStart} max={rangeEnd || undefined} />
          </div>
          <span className="text-secondary-300 shrink-0">—</span>
          <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none sm:w-36">
            <span className="text-xs text-secondary-400 shrink-0">Đến</span>
            <DateInput value={rangeEnd} onChange={setRangeEnd} min={rangeStart || undefined} />
          </div>
          {!isValidRange && rangeStart && rangeEnd && (
            <span className="text-xs text-danger-500 shrink-0">Ngày kết thúc phải sau ngày bắt đầu</span>
          )}
        </div>

        {/* Collapse */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-1 text-xs text-secondary-400 hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary-100 transition-colors shrink-0 ml-auto"
        >
          {collapsed ? <>Mở rộng <ChevronDown className="h-3.5 w-3.5" /></> : <>Thu gọn <ChevronUp className="h-3.5 w-3.5" /></>}
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="overflow-x-auto">
          {!isValidRange ? (
            <div className="flex flex-col items-center justify-center py-10 text-secondary-400 gap-2">
              <CalendarRange className="h-8 w-8 opacity-40" />
              <span className="text-sm font-medium">Chọn khoảng thời gian hợp lệ để xem lịch</span>
            </div>
          ) : (
            <div style={{ minWidth: `${180 + totalDays * 32}px` }}>
              {/* Day headers */}
              <div className="flex border-b border-border bg-surface-dim">
                <div className="shrink-0 w-44 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-secondary-400 border-r border-border flex items-end">
                  Ngày lễ
                </div>
                <div className="flex flex-1">
                  {days.map((day) => {
                    const iso = toIso(day);
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isToday = iso === today;
                    return (
                      <div
                        key={iso}
                        style={{ width: `${100 / totalDays}%` }}
                        className={cn(
                          'flex flex-col items-center justify-center py-1.5 text-[10px] font-semibold border-r border-border/50 last:border-r-0 gap-0.5',
                          isToday
                            ? 'text-primary-600 bg-primary-50'
                            : isWeekend
                            ? 'text-secondary-300'
                            : 'text-secondary-500',
                        )}
                      >
                        {day.getDate() === 1 && (
                          <span className="text-[8px] font-bold uppercase text-secondary-300">
                            T{day.getMonth() + 1}
                          </span>
                        )}
                        {isToday ? (
                          <span className="h-5 w-5 rounded-full bg-primary-500 text-white flex items-center justify-center text-[10px] font-bold">
                            {day.getDate()}
                          </span>
                        ) : (
                          day.getDate()
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rows */}
              {isLoading ? (
                <div className="divide-y divide-border">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex h-10 items-center">
                      <div className="shrink-0 w-44 px-3 border-r border-border h-full flex items-center">
                        <div className="h-3 w-28 rounded bg-secondary-100 animate-pulse" />
                      </div>
                      <div className="flex-1 px-2 py-1.5 h-full flex items-center">
                        <div
                          className="h-6 rounded-md bg-secondary-100 animate-pulse"
                          style={{ width: `${30 + i * 15}%`, marginLeft: `${i * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : projected.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-secondary-400 gap-2">
                  <CalendarRange className="h-8 w-8 opacity-40" />
                  <span className="text-sm font-medium">Không có ngày lễ nào trong khoảng thời gian này</span>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {projected.map(({ holiday, start, end }, idx) => {
                    const geo = getBarGeometry(start, end);
                    const label = surchargeLabel(holiday);

                    return (
                      <div key={`${holiday.id}-${idx}`} className="flex h-11 items-center hover:bg-secondary-50/50 transition-colors">
                        {/* Label */}
                        <div className="shrink-0 w-44 px-3 border-r border-border h-full flex items-center gap-1.5 overflow-hidden">
                          <CalendarRange className="shrink-0 h-3.5 w-3.5 text-secondary-400" />
                          <span className="text-xs font-medium text-foreground truncate" title={holiday.name}>
                            {holiday.name}
                          </span>
                        </div>

                        {/* Bar grid */}
                        <div className="relative flex-1 h-full">
                          {/* Day separators */}
                          <div className="absolute inset-0 flex pointer-events-none">
                            {days.map((day) => {
                              const iso = toIso(day);
                              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                              return (
                                <div
                                  key={iso}
                                  style={{ width: `${100 / totalDays}%` }}
                                  className={cn(
                                    'border-r border-border/30 last:border-r-0 h-full',
                                    isWeekend && 'bg-secondary-50/60',
                                    iso === today && 'bg-primary-50/40',
                                  )}
                                />
                              );
                            })}
                          </div>

                          {/* Bar */}
                          {geo && (
                            <button
                              onClick={() => onEdit(holiday)}
                              title={`${holiday.name}\n${holiday.startDay} – ${holiday.endDay}\n${label}`}
                              className={cn(
                                'absolute top-1/2 -translate-y-1/2 h-7 rounded-md text-white text-[10px] font-bold flex items-center px-2 gap-1 shadow-sm truncate transition-all cursor-pointer',
                                barColor[holiday.holidayType] ?? 'bg-secondary-500 hover:bg-secondary-600',
                              )}
                              style={{
                                left: `calc(${(geo.offsetDays / totalDays) * 100}% + 2px)`,
                                width: `calc(${(geo.spanDays / totalDays) * 100}% - 4px)`,
                              }}
                            >
                              <span className="truncate">{holiday.name}</span>
                              <span className="shrink-0 text-white/80">{label}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              {!isLoading && projected.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 border-t border-border bg-surface-dim">
                  {Object.entries(badgeColor).map(([type, cls]) => (
                    <span key={type} className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded', cls)}>
                      {type === 'ANNUAL' ? 'Hằng năm' : 'Năm cụ thể'}
                    </span>
                  ))}
                  <span className="text-[10px] text-secondary-300 ml-auto">* Bấm vào thanh để chỉnh sửa</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
