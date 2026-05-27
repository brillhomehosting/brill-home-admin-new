import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { CalendarDays, ChevronLeft, ChevronRight, Copy, Download, Loader2, RefreshCw } from 'lucide-react';
import { DateInput } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { useCleaningSchedule } from '../hooks/useDashboard';
import type { CleaningScheduleItem } from '@/shared/types';

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

function todayIso(): string {
  // Always use Vietnam timezone (UTC+7) to match the backend's processing timezone,
  // regardless of the admin's local machine timezone. (Fix H-2)
  return new Date().toLocaleDateString('en-CA', { timeZone: VN_TIMEZONE });
}

function shiftDate(isoDate: string, days: number): string {
  // Use UTC arithmetic to avoid DST issues when running in non-VN environments. (Fix L-8)
  const [y, mo, da] = isoDate.split('-').map(Number);
  const utcMs = Date.UTC(y, mo - 1, da) + days * 86_400_000;
  const shifted = new Date(utcMs);
  const ny = shifted.getUTCFullYear();
  const nm = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(shifted.getUTCDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}


function isRedRow(item: CleaningScheduleItem): boolean {
  // Red only when the slot is mid-chain: guest continues → do NOT clean yet.
  // The last slot of a consecutive chain (isLastConsecutiveSlot=true) must show WHITE — clean after checkout.
  return !!item.isConsecutive && !item.isLastConsecutiveSlot;
}

function rowBg(item: CleaningScheduleItem): string {
  if (isRedRow(item)) return '#fee2e2'; // red-100
  if (item.isOvernight) return '#fef9c3'; // yellow-100
  return '#ffffff';
}

/** Capture-ready table rendered with inline styles — avoids oklch parsing issues */
function CaptureTable({ items, date }: { items: CleaningScheduleItem[]; date: string }) {
  const thStyle: React.CSSProperties = {
    padding: '8px 0px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    color: '#374151',
    borderBottom: '2px solid #d1d5db',
    background: '#f3f4f6',
    whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '7px 0px',
    fontSize: '17px',
    fontWeight: 600,
    color: '#111827',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ background: '#ffffff', padding: '12px 0', fontFamily: 'Arial, sans-serif' }}>
      {/* Title + date */}
      <div style={{ padding: '4px 14px 10px', display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontWeight: 900, fontSize: 18, color: '#111827' }}>Lịch Dọn Phòng</span>
        <span style={{ fontSize: 14, color: '#6b7280' }}>{formatDisplayDate(date)}</span>
      </div>
      {/* Legend */}
      <div style={{ padding: '0 14px 8px', display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' }}>
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: '#fef9c3', border: '1px solid #ca8a04', marginRight: 4 }} />
          Qua đêm
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: '#fee2e2', border: '1px solid #dc2626', marginRight: 4 }} />
          Khung liên tiếp
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, paddingLeft: 48 }}>Ngày</th>
            <th style={thStyle}>Giờ bắt đầu</th>
            <th style={thStyle}>Giờ kết thúc</th>
            <th style={thStyle}>Phòng</th>
            <th style={{ ...thStyle, textAlign: 'center', paddingRight: 28 }}>Đã đặt</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ background: rowBg(item) }}>
              <td style={{ ...tdStyle, paddingLeft: 48 }}>{formatDisplayDate(item.date)}</td>
              <td style={{ ...tdStyle, fontWeight: 600 }}>{item.startTime}</td>
              <td style={{ ...tdStyle, fontWeight: 600 }}>{item.endTime}</td>
              <td style={{ ...tdStyle, fontWeight: 900, color: '#000000' }}>{item.roomName}</td>
              <td style={{ ...tdStyle, textAlign: 'center', paddingRight: 28 }}>
                {item.isBooked
                  ? <span style={{
                      display: 'inline-block',
                      background: isRedRow(item) ? '#fecaca' : '#dcfce7',
                      color: isRedRow(item) ? '#b91c1c' : '#15803d',
                      borderRadius: 5,
                      padding: '3px 10px',
                      fontWeight: 800,
                      fontSize: 14,
                      letterSpacing: '0.03em',
                    }}>✓ Đã đặt</span>
                  : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CleaningScheduleSection() {
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'done' | 'error'>('idle');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'working'>('idle');
  const [includeOvernightInExport, setIncludeOvernightInExport] = useState(true);
  const captureRef = useRef<HTMLDivElement>(null);

  const { data: items, isLoading, isError, isFetching, refetch } = useCleaningSchedule(selectedDate);

  const captureItems = items
    ? includeOvernightInExport
      ? items
      : items.filter(item => !(item.date === selectedDate && item.isOvernight))
    : [];

  const captureImage = async (): Promise<string> => {
    if (!captureRef.current) throw new Error('no ref');
    return toPng(captureRef.current, { pixelRatio: 4, cacheBust: true });
  };

  const handleCopy = async () => {
    setCopyStatus('copying');
    try {
      const dataUrl = await captureImage();
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopyStatus('done');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleDownload = async () => {
    setDownloadStatus('working');
    try {
      const dataUrl = await captureImage();
      const now = new Date();
      const dateCompact = selectedDate.replace(/-/g, '');
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `lich-don-phong-${dateCompact}${hh}${mm}.png`;
      a.click();
    } finally {
      setDownloadStatus('idle');
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-secondary-50/40">
        {/* Row 1 — title + refresh */}
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-secondary-900">Lịch Dọn Phòng</h2>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-secondary-500 transition hover:bg-secondary-100 hover:text-secondary-700 disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>

        {/* Row 2 — date nav + export */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-3.5 sm:px-5">
          {/* Date navigation */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 rounded-xl border border-border bg-white px-1 py-1 shadow-sm">
              <button
                type="button"
                onClick={() => setSelectedDate(d => shiftDate(d, -1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-secondary-500 transition hover:bg-secondary-100 hover:text-secondary-800"
                title="Ngày trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex-1 min-w-0 w-32 sm:w-36">
                <DateInput value={selectedDate} onChange={setSelectedDate} />
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(d => shiftDate(d, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-secondary-500 transition hover:bg-secondary-100 hover:text-secondary-800"
                title="Ngày tiếp theo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate(todayIso())}
              className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-secondary-600 shadow-sm transition hover:bg-secondary-50 hover:text-secondary-900 active:bg-secondary-100"
            >
              Hôm nay
            </button>
          </div>

          {/* Export controls */}
          <div className="flex w-full items-center justify-end gap-2 flex-wrap sm:w-auto">
            <label className="flex cursor-pointer select-none items-center gap-1.5 rounded-xl border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-secondary-600 shadow-sm transition hover:bg-secondary-50">
              <input
                type="checkbox"
                checked={includeOvernightInExport}
                onChange={e => setIncludeOvernightInExport(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-primary-600"
              />
              Gồm qua đêm hôm nay
            </label>

            <div className="flex items-center gap-0.5 rounded-xl border border-border bg-white px-1 py-1 shadow-sm">
              <button
                type="button"
                onClick={handleCopy}
                disabled={copyStatus === 'copying' || isLoading || !captureItems.length}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50',
                  copyStatus === 'done'
                    ? 'bg-green-100 text-green-700'
                    : copyStatus === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'text-secondary-700 hover:bg-secondary-100'
                )}
              >
                {copyStatus === 'copying'
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Copy className="h-3.5 w-3.5" />}
                {copyStatus === 'done' ? 'Đã copy!' : copyStatus === 'error' ? 'Lỗi' : 'Copy'}
              </button>

              <div className="h-4 w-px bg-border" />

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloadStatus === 'working' || isLoading || !captureItems.length}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-secondary-700 transition hover:bg-secondary-100 disabled:opacity-50"
              >
                {downloadStatus === 'working'
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Download className="h-3.5 w-3.5" />}
                Tải xuống
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2 sm:px-5 text-xs text-secondary-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-yellow-100 border border-yellow-300" />
          Qua đêm (hôm qua / ngày mai)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-100 border border-red-300" />
          Khung liên tiếp (không dọn giữa)
        </span>
      </div>

      {/* Visible content */}
      {isLoading ? (
        <div className="flex h-32 items-center justify-center gap-2 text-sm text-secondary-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải...
        </div>
      ) : isError ? (
        <div className="flex h-32 items-center justify-center text-sm text-red-500">
          Không thể tải lịch dọn phòng. Vui lòng thử lại.
        </div>
      ) : !items || items.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-secondary-400">
          Không có lịch dọn phòng cho ngày {formatDisplayDate(selectedDate)}.
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-secondary-100">
            {items.map((item, idx) => {
              const isRed = isRedRow(item);
              return (
                <div
                  key={`${item.roomId}-${item.startTime}-${idx}`}
                  className={cn(
                    'px-4 py-3',
                    isRed
                      ? 'bg-red-50'
                      : item.isOvernight
                        ? 'bg-yellow-50'
                        : 'bg-white'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-secondary-900 truncate">{item.roomName}</span>
                    {item.isBooked && (
                      <span className={cn(
                        'shrink-0 rounded px-2 py-0.5 text-xs font-bold',
                        isRed ? 'bg-red-200 text-red-700' : 'bg-green-100 text-green-700'
                      )}>
                        ✓ Đã đặt
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-secondary-500">
                    <span>{formatDisplayDate(item.date)}</span>
                    <span className="text-secondary-300">·</span>
                    <span className="font-medium text-secondary-700">{item.startTime} – {item.endTime}</span>
                    {isRed && (
                      <span className="ml-1 rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                        Khung liên tiếp
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-secondary-200 bg-secondary-50 text-xs font-semibold text-secondary-600 uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Ngày</th>
                  <th className="px-4 py-2.5 text-left">Giờ bắt đầu</th>
                  <th className="px-4 py-2.5 text-left">Giờ kết thúc</th>
                  <th className="px-4 py-2.5 text-left">Phòng</th>
                  <th className="px-4 py-2.5 text-center">Đã đặt</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={`${item.roomId}-${item.startTime}-${idx}`}
                    className={cn(
                      'border-b border-secondary-100 transition-colors',
                      isRedRow(item)
                        ? 'bg-red-50 hover:bg-red-100'
                        : item.isOvernight
                          ? 'bg-yellow-50 hover:bg-yellow-100'
                          : 'bg-white hover:bg-secondary-50'
                    )}
                  >
                    <td className="px-4 py-2 text-secondary-700">{formatDisplayDate(item.date)}</td>
                    <td className="px-4 py-2 font-medium text-secondary-800">{item.startTime}</td>
                    <td className="px-4 py-2 font-medium text-secondary-800">{item.endTime}</td>
                    <td className="px-4 py-2 font-semibold text-secondary-900">{item.roomName}</td>
                    <td className="px-4 py-2 text-center">
                      {item.isBooked && (
                        <span className={cn(
                          'inline-block rounded px-2 py-0.5 text-xs font-bold',
                          isRedRow(item)
                            ? 'bg-red-200 text-red-700'
                            : 'bg-green-100 text-green-700'
                        )}>
                          ✓ Đã đặt
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Off-screen capture node — inline styles only, no Tailwind/oklch */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          pointerEvents: 'none',
          width: 800,
        }}
      >
        <div ref={captureRef}>
          {captureItems.length > 0 && (
            <CaptureTable items={captureItems} date={selectedDate} />
          )}
        </div>
      </div>
    </section>
  );
}
