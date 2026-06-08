import { Header, PageWrapper } from '@/shared/components/layout';
import { DateInput } from '@/shared/components/ui';
import { dashboardService } from '@/shared/services/dashboard.service';
import type { PeriodRange, RevenueComparisonPeriodResult } from '@/shared/types';
import { cn, formatCurrency } from '@/shared/utils';
import {
  ArrowDown,
  ArrowUp,
  BarChart2,
  ChevronDown,
  ChevronUp,
  DoorOpen,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  TrendingUp,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ── Constants ─────────────────────────────────────────────────────────────

const LS_KEY = 'brillhome.revenue-comparison.periods';

const PERIOD_COLORS = ['#6366f1', '#f97316', '#16a34a', '#dc2626'];
const PERIOD_BG = ['bg-primary-50', 'bg-orange-50', 'bg-green-50', 'bg-red-50'];
const PERIOD_BORDER = ['border-primary-200', 'border-orange-200', 'border-green-200', 'border-red-200'];
const PERIOD_LABEL_COLOR = ['text-primary-600', 'text-orange-600', 'text-green-600', 'text-red-600'];

type PresetKey =
  | 'this_month' | 'last_month' | 'this_week' | 'last_week'
  | 'q1' | 'q2' | 'q3' | 'q4'
  | 'this_year' | 'last_year' | 'custom';

type PeriodConfig = {
  presetKey: PresetKey;
  startDate: string;
  endDate: string;
  label: string;
};

function today() {
  return new Date().toISOString().split('T')[0];
}

function fmt(date: Date) {
  return date.toISOString().split('T')[0];
}

function getPresetRange(key: Exclude<PresetKey, 'custom'>): { startDate: string; endDate: string; label: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (key) {
    case 'this_month':
      return { startDate: fmt(new Date(y, m, 1)), endDate: today(), label: `Tháng ${m + 1}/${y}` };
    case 'last_month': {
      const lm = m === 0 ? 11 : m - 1;
      const ly = m === 0 ? y - 1 : y;
      const lastDay = new Date(ly, lm + 1, 0);
      return { startDate: fmt(new Date(ly, lm, 1)), endDate: fmt(lastDay), label: `Tháng ${lm + 1}/${ly}` };
    }
    case 'this_week': {
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const mon = new Date(now); mon.setDate(now.getDate() + diff);
      return { startDate: fmt(mon), endDate: today(), label: 'Tuần này' };
    }
    case 'last_week': {
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const mon = new Date(now); mon.setDate(now.getDate() + diff - 7);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return { startDate: fmt(mon), endDate: fmt(sun), label: 'Tuần trước' };
    }
    case 'q1': return { startDate: `${y}-01-01`, endDate: `${y}-03-31`, label: `Q1/${y}` };
    case 'q2': return { startDate: `${y}-04-01`, endDate: `${y}-06-30`, label: `Q2/${y}` };
    case 'q3': return { startDate: `${y}-07-01`, endDate: `${y}-09-30`, label: `Q3/${y}` };
    case 'q4': return { startDate: `${y}-10-01`, endDate: `${y}-12-31`, label: `Q4/${y}` };
    case 'this_year': return { startDate: `${y}-01-01`, endDate: today(), label: `Năm ${y}` };
    case 'last_year': return { startDate: `${y - 1}-01-01`, endDate: `${y - 1}-12-31`, label: `Năm ${y - 1}` };
  }
}

const PRESET_OPTIONS: { value: PresetKey; label: string }[] = [
  { value: 'this_month', label: 'Tháng này' },
  { value: 'last_month', label: 'Tháng trước' },
  { value: 'this_week', label: 'Tuần này' },
  { value: 'last_week', label: 'Tuần trước' },
  { value: 'q1', label: 'Q1 năm nay' },
  { value: 'q2', label: 'Q2 năm nay' },
  { value: 'q3', label: 'Q3 năm nay' },
  { value: 'q4', label: 'Q4 năm nay' },
  { value: 'this_year', label: 'Năm nay' },
  { value: 'last_year', label: 'Năm ngoái' },
  { value: 'custom', label: 'Tùy chọn...' },
];

function buildDefaultPeriods(): PeriodConfig[] {
  const p1 = getPresetRange('this_month');
  const p2 = getPresetRange('last_month');
  return [
    { presetKey: 'this_month', ...p1 },
    { presetKey: 'last_month', ...p2 },
  ];
}

function loadFromStorage(): PeriodConfig[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return buildDefaultPeriods();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch { /* ignore */ }
  return buildDefaultPeriods();
}

function deltaLabel(base: number, compare: number): { text: string; positive: boolean; zero: boolean } {
  if (base === 0) return { text: compare > 0 ? '+∞' : '—', positive: compare > 0, zero: compare === 0 };
  const pct = ((compare - base) / base) * 100;
  const text = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
  return { text, positive: pct >= 0, zero: pct === 0 };
}

function formatShortDate(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function RevenueComparisonPage() {
  const [periods, setPeriods] = useState<PeriodConfig[]>(loadFromStorage);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'bookings' | 'bookingSlots'>('revenue');
  const [roomExpanded, setRoomExpanded] = useState(false);
  const [results, setResults] = useState<RevenueComparisonPeriodResult[] | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

  // auto-save to localStorage whenever periods change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(periods));
  }, [periods]);

  const handleCompare = useCallback(async (p: PeriodConfig[]) => {
    const payload: PeriodRange[] = p.map((cfg) => ({
      startDate: cfg.startDate,
      endDate: cfg.endDate,
      label: cfg.label,
    }));
    setIsPending(true);
    try {
      const data = await dashboardService.getRevenueComparison(payload);
      setResults(data);
      setVisibleIndices(new Set(data.map((_, i) => i)));
    } finally {
      setIsPending(false);
    }
  }, []);

  // auto-fetch on first load
  useEffect(() => {
    handleCompare(periods);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRefresh() {
    void handleCompare(periods);
  }

  function updatePeriod(idx: number, patch: Partial<PeriodConfig>) {
    setPeriods((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function handlePresetChange(idx: number, key: PresetKey) {
    if (key === 'custom') {
      updatePeriod(idx, { presetKey: 'custom' });
    } else {
      const range = getPresetRange(key);
      updatePeriod(idx, { presetKey: key, ...range });
    }
  }

  function addPeriod() {
    if (periods.length >= 4) return;
    const range = getPresetRange('last_month');
    setPeriods((prev) => [...prev, { presetKey: 'last_month', ...range }]);
  }

  function removePeriod(idx: number) {
    setPeriods((prev) => prev.filter((_, i) => i !== idx));
    setResults((prev) => prev ? prev.filter((_, i) => i !== idx) : null);
    setVisibleIndices((prev) => {
      const next = new Set<number>();
      prev.forEach((v) => { if (v < idx) next.add(v); else if (v > idx) next.add(v - 1); });
      return next;
    });
  }

  function toggleVisible(idx: number) {
    setVisibleIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) { if (next.size > 1) next.delete(idx); }
      else next.add(idx);
      return next;
    });
  }

  // ── Derived: only show checked periods ─────────────────────────────────

  const visibleEntries = results
    ?.map((r, i) => ({ r, originalIdx: i }))
    .filter(({ originalIdx }) => visibleIndices.has(originalIdx)) ?? [];

  const visibleResults = visibleEntries.map(({ r }) => r);
  // colors indexed by position-in-visible, always pointing to the original period color
  const visibleColors = visibleEntries.map(({ originalIdx }) => PERIOD_COLORS[originalIdx]);

  // ── Chart data ─────────────────────────────────────────────────────────

  const maxDays = visibleResults ? Math.max(...visibleResults.map((r) => r.dailyData.length)) : 0;
  const chartData = Array.from({ length: maxDays }, (_, i) => {
    const row: Record<string, number | string> = { day: `N${i + 1}` };
    visibleResults?.forEach((r, pi) => {
      const d = r.dailyData[i];
      row[`p${pi}`] = d ? (chartMetric === 'revenue' ? d.revenue : chartMetric === 'bookings' ? d.bookings : d.bookingSlots) : 0;
    });
    return row;
  });

  return (
    <>
      <Header title="So sánh doanh thu" />
      <PageWrapper className="space-y-6">

        {/* ── Period selectors ── */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-500">
                Chọn kỳ so sánh
              </h3>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700"
            >
              <RotateCcw className="h-3 w-3" /> Làm mới
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {periods.map((period, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative rounded-xl border p-4 space-y-3',
                  PERIOD_BG[idx],
                  PERIOD_BORDER[idx]
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs font-bold uppercase tracking-wider', PERIOD_LABEL_COLOR[idx])}>
                    Kỳ {idx + 1}
                  </span>
                  {periods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePeriod(idx)}
                      className="rounded p-0.5 text-secondary-400 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={period.presetKey}
                  onChange={(e) => handlePresetChange(idx, e.target.value as PresetKey)}
                  className="h-8 w-full rounded-lg border border-border bg-white px-2 text-xs font-medium text-secondary-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                >
                  {PRESET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5">
                  <DateInput
                    value={period.startDate}
                    max={period.endDate}
                    onChange={(v) => updatePeriod(idx, { startDate: v, presetKey: 'custom', label: `${v} → ${period.endDate}` })}
                    className="h-7 flex-1 rounded-lg bg-white text-[11px]"
                  />
                  <span className="text-[10px] text-secondary-400">→</span>
                  <DateInput
                    value={period.endDate}
                    min={period.startDate}
                    max={today()}
                    onChange={(v) => updatePeriod(idx, { endDate: v, presetKey: 'custom', label: `${period.startDate} → ${v}` })}
                    className="h-7 flex-1 rounded-lg bg-white text-[11px]"
                  />
                </div>

                <input
                  type="text"
                  value={period.label}
                  onChange={(e) => updatePeriod(idx, { label: e.target.value })}
                  placeholder="Tên kỳ..."
                  className="h-7 w-full rounded-lg border border-border bg-white px-2 text-xs text-secondary-700 placeholder:text-secondary-300 outline-none focus:border-primary-500"
                />
              </div>
            ))}

            {periods.length < 4 && (
              <button
                type="button"
                onClick={addPeriod}
                className="flex min-h-[9rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-xs font-bold text-secondary-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Thêm kỳ
              </button>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => void handleCompare(periods)}
              disabled={isPending || periods.some((p) => !p.startDate || !p.endDate)}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart2 className="h-4 w-4" />}
              So sánh
            </button>
          </div>
        </div>

        {/* ── Results ── */}
        {isPending && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-primary-500" />
          </div>
        )}

        {results && !isPending && (
          <>
            {/* Summary cards — all periods, each with a visibility checkbox */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {results.map((r, idx) => {
                const checked = visibleIndices.has(idx);
                const base = results[0];
                return (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-2xl border p-4 shadow-sm',
                      PERIOD_BG[idx],
                      PERIOD_BORDER[idx],
                      !checked && 'opacity-50'
                    )}
                  >
                    {/* Label row + checkbox */}
                    <div className="mb-2 flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ background: PERIOD_COLORS[idx] }}
                        />
                        <span className={cn('text-[11px] font-bold truncate', PERIOD_LABEL_COLOR[idx])}>
                          {r.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleVisible(idx)}
                        className={cn(
                          'flex-shrink-0 flex h-4 w-4 items-center justify-center rounded border',
                          checked
                            ? 'border-transparent'
                            : 'border-secondary-300 bg-white'
                        )}
                        style={checked ? { background: PERIOD_COLORS[idx] } : undefined}
                        title={checked ? 'Ẩn khỏi bảng' : 'Hiện trong bảng'}
                      >
                        {checked && (
                          <svg viewBox="0 0 10 8" className="h-2 w-2">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Date range */}
                    <p className="mb-1 text-[10px] font-medium text-secondary-400 tabular-nums">
                      {formatShortDate(r.startDate)} → {formatShortDate(r.endDate)}
                    </p>

                    <p className="text-lg font-bold text-foreground">{formatCurrency(r.totalRevenue)}</p>
                    <p className="text-xs text-secondary-500">{r.totalBookings} booking</p>
                    <p className="text-xs text-secondary-500">{r.totalBookingSlots} slot</p>

                    {idx > 0 && base && (
                      <div className="mt-2 space-y-0.5">
                        {(() => {
                          const dr = deltaLabel(base.totalRevenue, r.totalRevenue);
                          const db = deltaLabel(base.totalBookings, r.totalBookings);
                          const ds = deltaLabel(base.totalBookingSlots, r.totalBookingSlots);
                          return (
                            <>
                              <p className={cn('text-[11px] font-semibold', dr.zero ? 'text-secondary-400' : dr.positive ? 'text-green-600' : 'text-red-500')}>
                                Doanh thu: {dr.text}
                              </p>
                              <p className={cn('text-[11px] font-semibold', db.zero ? 'text-secondary-400' : db.positive ? 'text-green-600' : 'text-red-500')}>
                                Booking: {db.text}
                              </p>
                              <p className={cn('text-[11px] font-semibold', ds.zero ? 'text-secondary-400' : ds.positive ? 'text-green-600' : 'text-red-500')}>
                                Slot: {ds.text}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              {/* Table header bar */}
              <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-3.5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-600">Bảng so sánh</h3>
                <button
                  type="button"
                  onClick={() => setRoomExpanded((v) => !v)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold',
                    roomExpanded
                      ? 'border-primary-200 bg-primary-50 text-primary-600'
                      : 'border-border bg-white text-secondary-500 hover:border-primary-200 hover:text-primary-600'
                  )}
                >
                  <DoorOpen className="h-3.5 w-3.5" />
                  {roomExpanded ? 'Ẩn theo phòng' : 'Xem theo phòng'}
                  {roomExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-border">
                      {/* Metric label column */}
                      <th className="sticky left-0 z-10 bg-surface-dim px-3 py-3 sm:px-5 text-left text-[11px] font-bold uppercase tracking-widest text-secondary-400 min-w-[90px] w-[90px] sm:min-w-[140px] sm:w-[140px]" />

                      {/* Period columns */}
                      {visibleResults!.map((r, idx) => (
                        <th
                          key={idx}
                          className="px-5 py-3 text-right min-w-[150px]"
                          style={{ borderLeft: `3px solid ${visibleColors[idx]}20` }}
                        >
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                                style={{ background: visibleColors[idx] }}
                              />
                              {r.label}
                            </span>
                            <span className="text-[10px] font-medium text-secondary-400 tabular-nums">
                              {formatShortDate(r.startDate)} – {formatShortDate(r.endDate)}
                            </span>
                          </div>
                        </th>
                      ))}

                      {/* Delta columns */}
                      {visibleResults!.slice(1).map((r, idx) => (
                        <th
                          key={`dh${idx}`}
                          className="px-4 py-3 text-right min-w-[100px] bg-secondary-50/60"
                        >
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">
                              vs Kỳ 1
                            </span>
                            <span className="text-[10px] font-medium text-secondary-400 truncate max-w-[90px]">
                              {r.label}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* ── Summary section ── */}
                    <tr>
                      <td
                        colSpan={1 + visibleResults!.length + (visibleResults!.length - 1)}
                        className="sticky left-0 bg-surface px-3 sm:px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-secondary-400 border-b border-border/40"
                      >
                        Tổng kỳ
                      </td>
                    </tr>
                    <CompareRow
                      label="Doanh thu"
                      rawValues={visibleResults!.map((r) => r.totalRevenue)}
                      format={formatCurrency}
                      periodCount={visibleResults!.length}
                      colors={visibleColors}
                      bold
                    />
                    <CompareRow
                      label="Booking"
                      rawValues={visibleResults!.map((r) => r.totalBookings)}
                      format={(v) => `${v}`}
                      periodCount={visibleResults!.length}
                      colors={visibleColors}
                    />
                    <CompareRow
                      label="Slot booking"
                      rawValues={visibleResults!.map((r) => r.totalBookingSlots)}
                      format={(v) => `${v}`}
                      periodCount={visibleResults!.length}
                      colors={visibleColors}
                    />

                    {/* ── Room breakdown section ── */}
                    {roomExpanded && (() => {
                      const allRooms = Array.from(
                        new Map(
                          visibleResults!.flatMap((r) => r.byRoom.map((room) => [room.roomId, room.roomName]))
                        ).entries()
                      );
                      return (
                        <>
                          <tr>
                            <td
                              colSpan={1 + visibleResults!.length + (visibleResults!.length - 1)}
                              className="sticky left-0 bg-surface px-3 sm:px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-secondary-400 border-y border-border/40"
                            >
                              Theo phòng
                            </td>
                          </tr>
                          {allRooms.map(([roomId, roomName]) => (
                            <RoomRows
                              key={roomId}
                              roomName={roomName}
                              results={visibleResults!}
                              roomId={roomId}
                              colors={visibleColors}
                            />
                          ))}
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div className="flex flex-col gap-3 border-b border-border bg-surface-dim px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-500">Biểu đồ chi tiết theo ngày</h3>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-border bg-white text-xs font-bold overflow-hidden">
                    {(['revenue', 'bookings', 'bookingSlots'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setChartMetric(m)}
                        className={cn(
                          'px-3 py-1.5 transition-colors',
                          chartMetric === m ? 'bg-primary-600 text-white' : 'text-secondary-600 hover:bg-secondary-50'
                        )}
                      >
                        {m === 'revenue' ? 'Doanh thu' : m === 'bookings' ? 'Booking' : 'Slot'}
                      </button>
                    ))}
                  </div>
                  <div className="flex rounded-lg border border-border bg-white text-xs font-bold overflow-hidden">
                    {(['bar', 'line'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setChartType(t)}
                        className={cn(
                          'px-3 py-1.5 transition-colors',
                          chartType === t ? 'bg-primary-600 text-white' : 'text-secondary-600 hover:bg-secondary-50'
                        )}
                      >
                        {t === 'bar' ? 'Cột' : 'Đường'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 h-72">
                {maxDays === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-secondary-400 italic">
                    Không có dữ liệu
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          tickFormatter={chartMetric === 'revenue' ? (v) => `${(v / 1000).toFixed(0)}k` : undefined}
                          tickLine={false}
                          axisLine={false}
                          width={40}
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            const idx = Number(String(name).replace('p', ''));
                            const label = visibleResults![idx]?.label ?? name;
                            return [chartMetric === 'revenue' ? formatCurrency(Number(value)) : value, label];
                          }}
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                        />
                        <Legend
                          formatter={(value) => {
                            const idx = Number(String(value).replace('p', ''));
                            return visibleResults![idx]?.label ?? value;
                          }}
                          wrapperStyle={{ fontSize: 11 }}
                        />
                        {visibleResults!.map((_, idx) => (
                          <Bar key={idx} dataKey={`p${idx}`} fill={visibleColors[idx]} radius={[3, 3, 0, 0]} maxBarSize={20} />
                        ))}
                      </BarChart>
                    ) : (
                      <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          tickFormatter={chartMetric === 'revenue' ? (v) => `${(v / 1000).toFixed(0)}k` : undefined}
                          tickLine={false}
                          axisLine={false}
                          width={40}
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            const idx = Number(String(name).replace('p', ''));
                            const label = visibleResults![idx]?.label ?? name;
                            return [chartMetric === 'revenue' ? formatCurrency(Number(value)) : value, label];
                          }}
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                        />
                        <Legend
                          formatter={(value) => {
                            const idx = Number(String(value).replace('p', ''));
                            return visibleResults![idx]?.label ?? value;
                          }}
                          wrapperStyle={{ fontSize: 11 }}
                        />
                        {visibleResults!.map((_, idx) => (
                          <Line
                            key={idx}
                            type="monotone"
                            dataKey={`p${idx}`}
                            stroke={visibleColors[idx]}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                        ))}
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}
      </PageWrapper>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DeltaBadge({ base, compare }: { base: number; compare: number }) {
  const d = deltaLabel(base, compare);
  if (d.zero) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-md bg-secondary-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-secondary-400">
        <Minus className="h-2.5 w-2.5" />
        {d.text}
      </span>
    );
  }
  if (d.positive) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-bold tabular-nums text-green-700">
        <ArrowUp className="h-2.5 w-2.5" />
        {d.text}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold tabular-nums text-red-600">
      <ArrowDown className="h-2.5 w-2.5" />
      {d.text}
    </span>
  );
}

function CompareRow({
  label,
  rawValues,
  format,
  bold = false,
  indent = false,
  periodCount,
  colors,
}: {
  label: string;
  rawValues: number[];
  format: (v: number) => string;
  bold?: boolean;
  indent?: boolean;
  periodCount: number;
  colors: string[];
}) {
  const base = rawValues[0] ?? 0;
  return (
    <tr className={cn('border-b border-border/40 hover:bg-surface-dim/40', indent ? 'bg-white' : '')}>
      {/* Sticky label column */}
      <td
        className={cn(
          'sticky left-0 bg-inherit px-3 sm:px-5 py-3 text-xs',
          bold ? 'font-bold text-foreground' : 'font-medium text-secondary-600',
          indent && 'pl-6 sm:pl-10 font-normal text-secondary-500'
        )}
      >
        {label}
      </td>

      {/* Value columns */}
      {rawValues.map((v, idx) => (
        <td
          key={idx}
          className={cn('px-5 py-3 text-right text-xs tabular-nums', bold ? 'font-bold text-foreground' : 'font-medium text-secondary-700')}
          style={{ borderLeft: `3px solid ${colors[idx]}20` }}
        >
          {format(v)}
        </td>
      ))}

      {/* Delta columns */}
      {Array.from({ length: periodCount - 1 }, (_, i) => {
        const compareVal = rawValues[i + 1] ?? 0;
        return (
          <td key={`d${i}`} className="px-4 py-3 text-right bg-secondary-50/60">
            <div className="flex justify-end">
              <DeltaBadge base={base} compare={compareVal} />
            </div>
          </td>
        );
      })}
    </tr>
  );
}

function RoomRows({
  roomName,
  results,
  roomId,
  colors,
}: {
  roomName: string;
  results: RevenueComparisonPeriodResult[];
  roomId: string;
  colors: string[];
}) {
  const revenueValues = results.map((r) => r.byRoom.find((b) => b.roomId === roomId)?.revenue ?? 0);
  const bookingValues = results.map((r) => r.byRoom.find((b) => b.roomId === roomId)?.bookings ?? 0);
  const bookingSlotValues = results.map((r) => r.byRoom.find((b) => b.roomId === roomId)?.bookingSlots ?? 0);
  const colSpan = 1 + results.length + (results.length - 1);
  return (
    <>
      {/* Room name header row */}
      <tr className="border-b border-border/30 bg-secondary-50/70">
        <td
          colSpan={colSpan}
          className="sticky left-0 px-3 sm:px-5 py-2"
        >
          <span className="flex items-center gap-2 text-xs font-bold text-secondary-600">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-secondary-100">
              <DoorOpen className="h-3 w-3 text-secondary-500" />
            </span>
            {roomName}
          </span>
        </td>
      </tr>
      <CompareRow
        label="Doanh thu"
        rawValues={revenueValues}
        format={formatCurrency}
        indent
        periodCount={results.length}
        colors={colors}
      />
      <CompareRow
        label="Booking"
        rawValues={bookingValues}
        format={(v) => `${v}`}
        indent
        periodCount={results.length}
        colors={colors}
      />
      <CompareRow
        label="Slot booking"
        rawValues={bookingSlotValues}
        format={(v) => `${v}`}
        indent
        periodCount={results.length}
        colors={colors}
      />
    </>
  );
}
