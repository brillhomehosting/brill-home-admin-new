import { discountScope } from '../discountLabels';
import { DateInput } from '@/shared/components/ui/DateInput';
import type { DiscountCampaign, DiscountTargetType } from '@/shared/types';
import { cn, formatCurrency, formatDate } from '@/shared/utils';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { useDiscountsCalendar } from '../hooks/useDiscounts';

const typeColors: Record<DiscountTargetType, string> = {
  ROOM_WEEK_DAY: 'bg-rose-50 text-rose-700 border border-rose-200',
  ALL: 'bg-info-50 text-indigo-700 border border-info-200',
  WEEK_DAY: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  SLOT_TYPE: 'bg-amber-50 text-amber-700 border border-amber-200',
  ROOM_TYPE: 'bg-pink-50 text-pink-700 border border-pink-200',
  ROOM: 'bg-purple-50 text-purple-700 border border-purple-200',
};

const typeBarColors: Record<DiscountTargetType, string> = {
  ROOM_WEEK_DAY: 'bg-rose-500 hover:bg-rose-600',
  ALL: 'bg-indigo-500 hover:bg-indigo-600',
  WEEK_DAY: 'bg-emerald-500 hover:bg-emerald-600',
  SLOT_TYPE: 'bg-amber-500 hover:bg-amber-600',
  ROOM_TYPE: 'bg-pink-500 hover:bg-pink-600',
  ROOM: 'bg-purple-500 hover:bg-purple-600',
};

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

interface Props {
  onEdit: (campaign: DiscountCampaign) => void;
}

export function DiscountCalendarSection({ onEdit }: Props) {
  const now = new Date();
  const defaultStart = toIso(new Date(now.getFullYear(), now.getMonth(), 1));
  const defaultEnd = toIso(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const [rangeStart, setRangeStart] = useState(defaultStart);
  const [rangeEnd, setRangeEnd] = useState(defaultEnd);
  const [collapsed, setCollapsed] = useState(false);

  const isValidRange = rangeStart && rangeEnd && rangeStart <= rangeEnd;

  const { data: campaigns = [], isLoading } = useDiscountsCalendar(rangeStart, rangeEnd);

  // Build the day list only for valid ranges (cap display at 366 days to stay usable)
  const days = isValidRange ? buildDayList(rangeStart, rangeEnd).slice(0, 366) : [];
  const totalDays = days.length;

  const today = toIso(now);

  // Month-jump helpers
  function jumpPrevMonth() {
    const ref = toLocalDate(rangeStart);
    const first = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
    const last = new Date(ref.getFullYear(), ref.getMonth(), 0);
    setRangeStart(toIso(first));
    setRangeEnd(toIso(last));
  }

  function jumpNextMonth() {
    const ref = toLocalDate(rangeStart);
    const first = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
    const last = new Date(ref.getFullYear(), ref.getMonth() + 2, 0);
    setRangeStart(toIso(first));
    setRangeEnd(toIso(last));
  }

  function jumpCurrentMonth() {
    setRangeStart(defaultStart);
    setRangeEnd(defaultEnd);
  }

  // Compute bar geometry for a campaign over the displayed range
  function getBarGeometry(c: DiscountCampaign) {
    if (!isValidRange || totalDays === 0) return null;
    const barStartIso = c.startDate < rangeStart ? rangeStart : c.startDate;
    const barEndIso = c.endDate > rangeEnd ? rangeEnd : c.endDate;
    if (barStartIso > barEndIso) return null;

    const offsetDays = days.findIndex((d) => toIso(d) === barStartIso);
    if (offsetDays === -1) return null;
    const spanDays =
      Math.round((toLocalDate(barEndIso).getTime() - toLocalDate(barStartIso).getTime()) / 86_400_000) + 1;

    return { offsetDays, spanDays };
  }

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 bg-surface/50 border-b border-border sm:flex sm:flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <CalendarDays className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-bold text-foreground">Lịch chiến dịch</span>
        </div>

        {/* Month jump controls */}
        <div className="order-3 col-span-2 flex w-full items-center justify-between gap-1 rounded-lg bg-secondary-50 p-1 sm:order-none sm:col-span-1 sm:w-auto sm:justify-start sm:bg-transparent sm:p-0">
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
            title="Về tháng hiện tại"
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

        {/* Custom date range pickers */}
        <div className="order-4 col-span-2 grid w-full grid-cols-1 gap-2 sm:order-none sm:col-span-1 sm:flex sm:flex-1 sm:items-center sm:min-w-0">
          <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2 sm:flex sm:min-w-0 sm:flex-none sm:w-36">
            <span className="text-xs text-secondary-400 shrink-0">Từ</span>
            <DateInput
              value={rangeStart}
              onChange={(v) => setRangeStart(v)}
              max={rangeEnd || undefined}
            />
          </div>
          <span className="hidden text-secondary-300 shrink-0 sm:block">—</span>
          <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2 sm:flex sm:min-w-0 sm:flex-none sm:w-36">
            <span className="text-xs text-secondary-400 shrink-0">Đến</span>
            <DateInput
              value={rangeEnd}
              onChange={(v) => setRangeEnd(v)}
              min={rangeStart || undefined}
            />
          </div>
          {!isValidRange && rangeStart && rangeEnd && (
            <span className="text-xs text-danger-500 sm:shrink-0">Ngày kết thúc phải sau ngày bắt đầu</span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="justify-self-end flex items-center gap-1 text-xs text-secondary-400 hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary-100 transition-colors shrink-0 sm:ml-auto"
        >
          {collapsed ? (
            <>Mở rộng <ChevronDown className="h-3.5 w-3.5" /></>
          ) : (
            <>Thu gọn <ChevronUp className="h-3.5 w-3.5" /></>
          )}
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="overflow-x-auto">
          {!isValidRange ? (
            <div className="flex flex-col items-center justify-center py-10 text-secondary-400 gap-2">
              <CalendarDays className="h-8 w-8 opacity-40" />
              <span className="text-sm font-medium">Chọn khoảng thời gian hợp lệ để xem lịch</span>
            </div>
          ) : (
            <div style={{ minWidth: `${180 + totalDays * 32}px` }}>
              {/* Day headers */}
              <div className="flex border-b border-border bg-surface-dim">
                <div className="shrink-0 w-44 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-secondary-400 border-r border-border flex items-end">
                  Chiến dịch
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
                        {/* Show month label on the 1st of each month */}
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

              {/* Campaign rows */}
              {isLoading ? (
                <div className="divide-y divide-border">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex h-10 items-center">
                      <div className="shrink-0 w-44 px-3 border-r border-border h-full flex items-center">
                        <div className="h-3 w-28 rounded bg-secondary-100 animate-pulse" />
                      </div>
                      <div className="flex-1 px-2 py-1.5 relative h-full flex items-center">
                        <div
                          className="h-6 rounded-md bg-secondary-100 animate-pulse"
                          style={{ width: `${30 + i * 15}%`, marginLeft: `${i * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-secondary-400 gap-2">
                  <CalendarDays className="h-8 w-8 opacity-40" />
                  <span className="text-sm font-medium">Không có chiến dịch nào trong khoảng thời gian này</span>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {campaigns.map((campaign) => {
                    const geo = getBarGeometry(campaign);
                    const discountLabel =
                      campaign.discountType === 'PERCENTAGE'
                        ? `-${campaign.discountValue}%`
                        : `-${formatCurrency(campaign.discountValue)}`;

                    return (
                      <div key={campaign.id} className="flex h-11 items-center hover:bg-secondary-50/50 transition-colors">
                        {/* Label */}
                        <div className="shrink-0 w-44 px-3 border-r border-border h-full flex items-center gap-1.5 overflow-hidden">
                          <span
                            className={cn(
                              'shrink-0 w-1.5 h-1.5 rounded-full',
                              campaign.status === 'ACTIVE' ? 'bg-success-500' : 'bg-secondary-300',
                            )}
                          />
                          <span className="text-xs font-medium text-foreground truncate" title={campaign.name}>
                            {campaign.name}
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
                              onClick={() => onEdit(campaign)}
                              title={`${campaign.name}\n${discountScope(campaign)}\n${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}\n${discountLabel}`}
                              className={cn(
                                'absolute top-1/2 -translate-y-1/2 h-7 rounded-md text-white text-[10px] font-bold flex items-center px-2 gap-1 shadow-sm truncate transition-all cursor-pointer',
                                typeBarColors[campaign.type],
                                campaign.status === 'INACTIVE' && 'opacity-50 saturate-50',
                              )}
                              style={{
                                left: `calc(${(geo.offsetDays / totalDays) * 100}% + 2px)`,
                                width: `calc(${(geo.spanDays / totalDays) * 100}% - 4px)`,
                              }}
                            >
                              <span className="truncate">{campaign.name}</span>
                              <span className="shrink-0 text-white/80">{discountLabel}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              {!isLoading && campaigns.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 border-t border-border bg-surface-dim">
                  {(Object.entries(typeColors) as [DiscountTargetType, string][]).map(([type, cls]) => (
                    <div key={type} className="flex items-center gap-1">
                      <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded', cls)}>
                        {type === 'ROOM_WEEK_DAY' ? 'Phòng + ngày' : type}
                      </span>
                    </div>
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
