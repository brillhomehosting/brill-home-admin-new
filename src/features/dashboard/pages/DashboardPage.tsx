import { Header, PageWrapper } from '@/shared/components/layout';
import type { BookingAvailabilitySlot, RoomTracker } from '@/shared/types';
import { cn, formatCurrency, formatDate } from '@/shared/utils';
import {
    AlertCircle,
    ArrowRight,
    CalendarCheck,
    CalendarDays,
    CreditCard,
    Home,
    Loader2,
    Percent,
    RotateCcw,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { RecentBookingItem, UpcomingBookingItem } from '@/features/bookings/components/BookingCard';
import { useAllRoomsAvailability, useDashboardStats, usePaymentStats, useRecentBookings, useRevenueTrend, useRoomTrackers, useUpcomingBookings } from '../hooks/useDashboard';

function getDefaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function fillMissingDates(
  data: { date: string; revenue: number; bookingCount: number }[],
  startDate: string,
  endDate: string
) {
  const byDate = new Map(data.map((d) => [d.date, d]));
  const result = [];
  const cursor = new Date(startDate);
  const end = new Date(endDate);
  while (cursor <= end) {
    const key = cursor.toISOString().split('T')[0];
    result.push(byDate.get(key) ?? { date: key, revenue: 0, bookingCount: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentBookings();
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingBookings();
  const { data: paymentStats, isLoading: paymentLoading } = usePaymentStats();

  const { data: trackers, isLoading: trackersLoading, isRefetching: isRefetchingTrackers, refetch: refetchTrackers } = useRoomTrackers();

  const today = new Date().toISOString().split('T')[0];
  const { data: allAvailability } = useAllRoomsAvailability(today);

  const defaultRange = getDefaultRange();
  const [trendStart, setTrendStart] = useState(defaultRange.start);
  const [trendEnd, setTrendEnd] = useState(defaultRange.end);
  const { data: trendData, isLoading: trendLoading } = useRevenueTrend(trendStart, trendEnd);

  const isLoading = statsLoading || recentLoading || upcomingLoading || paymentLoading;

  const growthPct = stats?.revenueLastMonth
    ? (((paymentStats?.revenueThisMonth ?? 0) - stats.revenueLastMonth) / stats.revenueLastMonth * 100)
    : null;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-surface">
        <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface-dim/30">
      <Header
        title="Dashboard"
        actions={
          <div className="flex items-center gap-2 text-sm text-secondary-500">
            <CalendarDays className="h-4 w-4" />
            {formatDate(new Date().toISOString())}
          </div>
        }
      />

      <PageWrapper className="flex-1 space-y-6 pt-4 pb-10 px-4 sm:pt-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* --- Monthly Revenue --- */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-primary-50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 rounded-xl bg-primary-100 text-primary-600">
                  {growthPct !== null && growthPct < 0
                    ? <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    : <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  }
                </div>
                {growthPct !== null ? (
                  <span className={cn(
                    "text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    growthPct >= 0
                      ? "text-success-600 bg-success-50 border-success-100"
                      : "text-danger-600 bg-danger-50 border-danger-100"
                  )}>
                    {growthPct >= 0 ? '+' : ''}{growthPct.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-bold text-secondary-400 bg-secondary-50 px-2 py-0.5 rounded-full border border-secondary-100">
                    N/A
                  </span>
                )}
              </div>

              <div className="mb-4 sm:mb-6">
                <p className="text-[9px] sm:text-[10px] font-bold text-secondary-400 uppercase tracking-wider mb-1">Doanh thu tháng này</p>
                <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {formatCurrency(paymentStats?.revenueThisMonth ?? 0)}
                </h3>
                {stats?.revenueLastMonth ? (
                  <p className="text-[10px] text-secondary-400 mt-1">
                    Tháng trước: <span className="font-semibold text-secondary-600">{formatCurrency(stats.revenueLastMonth)}</span>
                  </p>
                ) : null}
              </div>

              <div className="mt-auto flex flex-col gap-2">
                <Link
                  to="/apps/bookings/create"
                  className="flex items-center justify-center gap-2 w-full py-2 sm:py-2.5 rounded-xl bg-primary-600 text-white font-bold text-[10px] sm:text-xs hover:bg-primary-700 transition-all shadow-sm"
                >
                  TẠO BOOKING MỚI
                </Link>
                <Link
                  to="/apps/invoices"
                  className="flex items-center justify-center gap-2 w-full py-2 sm:py-2.5 rounded-xl bg-secondary-50 text-secondary-600 font-bold text-[10px] sm:text-xs hover:bg-secondary-100 transition-all border border-secondary-100"
                >
                  Chi tiết doanh thu
                </Link>
              </div>
            </div>
          </div>

          {/* --- Payment Method Distribution --- */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent-500" />
              Phân bổ phương thức
            </h3>

            <div className="space-y-5">
              {(paymentStats?.byMethod || []).length > 0 ? (
                paymentStats?.byMethod.map((item, idx) => {
                  const methodMap: Record<string, string> = {
                    CASH: 'Tiền mặt',
                    BANK_TRANSFER: 'Chuyển khoản',
                    CREDIT_CARD: 'Thẻ tín dụng',
                    MOMO: 'Ví MoMo',
                    VNPAY: 'VNPay',
                    ZALOPAY: 'ZaloPay',
                    'KhÃ¡ch hÃ ng cÅ©': 'Khách hàng cũ',
                    'KhÃ¡ch hÃ ng má»›i': 'Khách hàng mới',
                    'Khách hàng cũ': 'Khách hàng cũ',
                    'Khách hàng mới': 'Khách hàng mới',
                  };
                  const methodLabel = methodMap[item.key] || item.key;
                  return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-secondary-700">{methodLabel}</span>
                      <span className="text-secondary-400 font-medium">
                        {item.count} GD · <span className="text-foreground font-bold">{formatCurrency(item.amount)}</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary-50 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          idx === 0 ? "bg-primary-400" : idx === 1 ? "bg-accent-400" : "bg-secondary-400"
                        )}
                        style={{ width: paymentStats?.totalPaidAmount ? `${(item.amount / paymentStats.totalPaidAmount) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                  );
                })
              ) : (
                <div className="flex h-full items-center justify-center py-10 opacity-40">
                   <p className="text-xs italic">Chưa có dữ liệu phân bổ</p>
                </div>
              )}

              <div className="mt-auto p-4 rounded-xl bg-surface-dim/50 border border-border border-dashed">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                     <Percent className="h-4 w-4 text-primary-500" />
                  </div>
                  <div>
                     <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-tight">Giá trị trung bình</p>
                     <p className="text-sm font-bold text-foreground">{formatCurrency(paymentStats?.avgPaidAmount ?? 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Stats Row --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Booking đã xác nhận"
            value={stats?.confirmedBookingsToday ?? 0}
            icon={CalendarCheck}
            color="primary"
            footer={<p className="text-xs text-secondary-400 italic">Check-in hôm nay</p>}
          />

          <StatCard
            title="Phòng đang có khách"
            value={stats?.occupiedRooms ?? 0}
            icon={Home}
            color="warning"
            footer={
              <span className="text-xs font-medium text-secondary-500 flex items-center gap-1">
                <span className="font-semibold text-success-600">{stats?.vacantRooms ?? 0}</span> phòng trống
              </span>
            }
          />

          <StatCard
            title="Doanh thu hôm nay"
            value={formatCurrency(stats?.revenueToday ?? 0)}
            icon={TrendingUp}
            color="success"
            footer={<p className="text-xs text-secondary-400 italic">Cập nhật trực tiếp</p>}
          />
        </div>

        {/* --- Revenue Trend Chart --- */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border bg-surface-dim px-6 py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-500" />
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Xu hướng doanh thu</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={trendStart}
                max={trendEnd}
                onChange={(e) => setTrendStart(e.target.value)}
                className="rounded-lg border border-border bg-white px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
              <span className="text-secondary-400">→</span>
              <input
                type="date"
                value={trendEnd}
                min={trendStart}
                max={today}
                onChange={(e) => setTrendEnd(e.target.value)}
                className="rounded-lg border border-border bg-white px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
            </div>
          </div>
          <div className="p-4 sm:p-6 h-64">
            {trendLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            ) : trendData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fillMissingDates(trendData, trendStart, trendEnd)} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(v) => v.slice(5)}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value, name) =>
                      name === 'revenue'
                        ? [formatCurrency(Number(value)), 'Doanh thu']
                        : [value, 'Booking']
                    }
                    labelFormatter={(label) => `Ngày ${label}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <EmptyState message="Không có dữ liệu trong khoảng thời gian này" />
              </div>
            )}
          </div>
        </div>

        {/* --- Room Tracker Section --- */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-surface-dim px-6 py-4">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary-500" />
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Tình trạng phòng hiện tại</h3>
            </div>
            <button
              onClick={() => refetchTrackers()}
              disabled={trackersLoading || isRefetchingTrackers}
              className="text-xs font-bold text-secondary-500 hover:text-primary-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className={cn("h-3 w-3", (trackersLoading || isRefetchingTrackers) && "animate-spin")} />
              Cập nhật
            </button>
          </div>
          {trackersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : trackers?.length ? (
            <>
              {/* Mobile: compact list — hidden on sm+ */}
              <div className="sm:hidden divide-y divide-border">
                {trackers.map((tracker) => {
                  const roomAvailability = allAvailability?.find(a => a.roomId === tracker.roomId);
                  const slots = roomAvailability?.timeslots[0]?.timeSlots || [];
                  return <RoomTrackerRow key={tracker.roomId} tracker={tracker} slots={slots} />;
                })}
              </div>
              {/* Desktop: card grid — hidden on mobile */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-surface-dim/30">
                {trackers.map((tracker) => {
                  const roomAvailability = allAvailability?.find(a => a.roomId === tracker.roomId);
                  const slots = roomAvailability?.timeslots[0]?.timeSlots || [];
                  return <RoomTrackerItem key={tracker.roomId} tracker={tracker} slots={slots} />;
                })}
              </div>
            </>
          ) : (
            <div className="p-4">
              <EmptyState message="Không có dữ liệu phòng" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* --- Recent Bookings --- */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary-100">
                  <RotateCcw className="h-3.5 w-3.5 text-primary-600" />
                </div>
                <h3 className="font-bold text-foreground text-sm">Đặt phòng gần đây</h3>
                {recent?.length ? (
                  <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">
                    {recent.length}
                  </span>
                ) : null}
              </div>
              <Link
                to="/apps/bookings"
                className="flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                Xem tất cả <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/60">
              {recent?.length ? (
                recent.slice(0, 5).map((booking) => (
                  <RecentBookingItem key={booking.bookingId} booking={booking} />
                ))
              ) : (
                <EmptyState message="Không có booking gần đây" />
              )}
            </div>
          </div>

          {/* --- Upcoming Check-ins --- */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent-100">
                  <CalendarDays className="h-3.5 w-3.5 text-accent-600" />
                </div>
                <h3 className="font-bold text-foreground text-sm">Sắp check-in</h3>
                {upcoming?.length ? (
                  <span className="text-[10px] font-bold bg-accent-100 text-accent-700 px-1.5 py-0.5 rounded-full">
                    {upcoming.length}
                  </span>
                ) : null}
              </div>
              <Link
                to="/apps/bookings"
                className="flex items-center gap-1 text-[11px] font-bold text-accent-600 hover:text-accent-700 bg-accent-50 hover:bg-accent-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                Lịch trình <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/60">
              {upcoming?.length ? (
                upcoming.slice(0, 5).map((booking) => (
                  <UpcomingBookingItem key={booking.bookingId} booking={booking} />
                ))
              ) : (
                <EmptyState message="Không có lịch check-in sắp tới" />
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

// ── Components ──

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  footer
}: {
  title: string;
  value: string | number;
  icon: any;
  color: 'primary' | 'warning' | 'success' | 'accent' | 'danger';
  footer: React.ReactNode;
}) {
  const colorMapping = {
    primary: 'bg-primary-50 text-primary-500 ring-primary-100',
    warning: 'bg-warning-50 text-warning-500 ring-warning-100',
    success: 'bg-success-50 text-success-500 ring-success-100',
    accent: 'bg-accent-50 text-accent-500 ring-accent-100',
    danger: 'bg-danger-50 text-danger-500 ring-danger-100',
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider">{title}</p>
          <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-black text-foreground tracking-tight group-hover:text-primary-600 transition-colors">
            {value}
          </p>
        </div>
        <div className={cn('flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-110', colorMapping[color])}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
      <div className="mt-0.5 sm:mt-1">
        {footer}
      </div>
    </div>
  );
}


function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <AlertCircle className="mb-2 h-8 w-8 text-secondary-200" />
      <p className="text-xs text-secondary-400 font-medium">{message}</p>
    </div>
  );
}

function getTrackerGuestName(guestName: string | null | undefined, fallback = 'Khách chưa có tên') {
  if (!guestName) {
    return fallback;
  }

  return guestName.includes('Ã') ? 'Khách hàng cũ' : guestName;
}

function RoomTrackerRow({ tracker, slots }: { tracker: RoomTracker; slots: BookingAvailabilitySlot[] }) {
  const isAvailable = tracker.status === 'AVAILABLE' || tracker.status === 'VACANT';

  const dotColor =
    isAvailable ? '#10b981' :
    tracker.status === 'OCCUPIED' ? '#ef4444' :
    tracker.status === 'RESERVED' ? '#f59e0b' : '#9ca3af';

  const statusColor =
    isAvailable ? 'bg-success-100 text-success-700' :
    tracker.status === 'OCCUPIED' ? 'bg-danger-100 text-danger-700' :
    tracker.status === 'RESERVED' ? 'bg-warning-100 text-warning-700' :
    'bg-secondary-100 text-secondary-700';

  const statusLabel =
    isAvailable ? 'Trống' :
    tracker.status === 'OCCUPIED' ? 'Có khách' :
    tracker.status === 'RESERVED' ? 'Đã đặt' :
    tracker.status;

  const bookedSlots = slots.filter(s => s.status === 'BOOKED' || s.status === 'PENDING');
  const freeSlots = slots.filter(s => s.status !== 'BOOKED' && s.status !== 'PENDING');

  return (
    <div className="px-4 py-3 bg-surface">
      {/* Row 1: room name + status badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
          <span className="font-bold text-foreground text-sm">{tracker.roomName}</span>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", statusColor)}>
          {statusLabel}
        </span>
      </div>

      {/* Row 2: current + next booking side by side */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {/* Current booking */}
        <div className={cn(
          "rounded-lg p-2 border",
          tracker.currentBooking
            ? "bg-primary-50/60 border-primary-100"
            : "bg-secondary-50 border-border border-dashed"
        )}>
          <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-wider mb-1">Hiện tại</p>
          {tracker.currentBooking ? (
            <>
              <Link
                to={`/apps/bookings/${tracker.currentBooking.bookingId}`}
                className="font-semibold text-foreground truncate block hover:text-primary-600"
                title={getTrackerGuestName(tracker.currentBooking.guestName)}
              >
                {getTrackerGuestName(tracker.currentBooking.guestName, 'Khách cũ')}
              </Link>
              <p className="text-secondary-500 text-[10px] mt-0.5">
                Out: <span className="font-medium text-foreground">{formatDate(tracker.currentBooking.checkOutAt, { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
              {tracker.currentBooking.minutesUntilCheckout !== undefined &&
               tracker.currentBooking.minutesUntilCheckout <= 120 &&
               tracker.currentBooking.minutesUntilCheckout >= 0 && (
                <p className="text-[9px] text-danger-600 font-bold mt-0.5">
                  ⚠ Còn {tracker.currentBooking.minutesUntilCheckout} phút
                </p>
              )}
            </>
          ) : (
            <p className="text-secondary-400 italic text-[10px]">Phòng trống</p>
          )}
        </div>

        {/* Next booking */}
        <div className={cn(
          "rounded-lg p-2 border",
          tracker.nextBooking
            ? "bg-warning-50/40 border-warning-100"
            : "bg-secondary-50 border-border border-dashed"
        )}>
          <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-wider mb-1">Tiếp theo</p>
          {tracker.nextBooking ? (
            <>
              <Link
                to={`/apps/bookings/${tracker.nextBooking.bookingId}`}
                className="font-semibold text-foreground truncate block hover:text-primary-600"
                title={getTrackerGuestName(tracker.nextBooking.guestName)}
              >
                {getTrackerGuestName(tracker.nextBooking.guestName, 'Khách cũ')}
              </Link>
              <p className="text-secondary-500 text-[10px] mt-0.5">
                In: <span className="font-medium text-foreground">{formatDate(tracker.nextBooking.checkInAt, { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            </>
          ) : (
            <p className="text-secondary-400 italic text-[10px]">Chưa có</p>
          )}
        </div>
      </div>

      {/* Row 3: time slots (compact chips) */}
      {slots.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {freeSlots.length > 0 && (
            <span className="text-[9px] font-bold text-success-600 bg-success-50 border border-success-100 px-1.5 py-0.5 rounded-md">
              {freeSlots.length} slot trống
            </span>
          )}
          {bookedSlots.map((slot) => {
            const timeRange = `${slot.timeSlot.startTime.split(':').slice(0,2).join(':')}–${slot.timeSlot.endTime.split(':').slice(0,2).join(':')}`;
            return (
              <span key={slot.timeSlot.id} className="text-[9px] font-bold text-danger-600 bg-danger-50 border border-danger-100 px-1.5 py-0.5 rounded-md">
                {timeRange}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RoomTrackerItem({ tracker, slots }: { tracker: RoomTracker; slots: BookingAvailabilitySlot[] }) {
  const isAvailable = tracker.status === 'AVAILABLE' || tracker.status === 'VACANT';

  const statusColor =
    isAvailable ? 'bg-success-100 text-success-700 border-success-200' :
    tracker.status === 'OCCUPIED' ? 'bg-danger-100 text-danger-700 border-danger-200' :
    tracker.status === 'RESERVED' ? 'bg-warning-100 text-warning-700 border-warning-200' :
    'bg-secondary-100 text-secondary-700 border-secondary-200';

  const statusLabel =
    isAvailable ? 'Trống' :
    tracker.status === 'OCCUPIED' ? 'Đang có khách' :
    tracker.status === 'RESERVED' ? 'Đã đặt' :
    tracker.status;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-3 border-b border-border flex justify-between items-center bg-surface-dim/30">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: isAvailable ? '#10b981' : tracker.status === 'OCCUPIED' ? '#ef4444' : tracker.status === 'RESERVED' ? '#f59e0b' : '#9ca3af' }} />
          <h4 className="font-bold text-foreground text-sm">{tracker.roomName}</h4>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", statusColor)}>
          {statusLabel}
        </span>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-3 text-xs h-[230px]">
        {tracker.currentBooking ? (
          <div className="space-y-1 bg-primary-50/50 p-2 rounded-lg border border-primary-100 h-[70px] relative overflow-hidden">
            <div className="flex justify-between items-center text-secondary-500 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Hiện tại</span>
              <Link to={`/apps/bookings/${tracker.currentBooking.bookingId}`} className="text-primary-600 hover:underline">#{tracker.currentBooking.bookingCode}</Link>
            </div>
            <p className="font-semibold text-foreground truncate text-[11px]" title={getTrackerGuestName(tracker.currentBooking.guestName)}>
              {getTrackerGuestName(tracker.currentBooking.guestName)}
            </p>
            <p className="text-secondary-500">
              Out: <span className="font-medium text-foreground">{formatDate(tracker.currentBooking.checkOutAt, { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
            {tracker.currentBooking.minutesUntilCheckout !== undefined && tracker.currentBooking.minutesUntilCheckout <= 120 && tracker.currentBooking.minutesUntilCheckout >= 0 && (
              <p className="text-[9px] text-danger-600 font-bold bg-danger-50 px-1 py-0.5 rounded mt-0.5 inline-block border border-danger-100">
                Còn {tracker.currentBooking.minutesUntilCheckout} phút
              </p>
            )}
          </div>
        ) : (
          <div className="bg-secondary-50 p-2 rounded-lg border border-border border-dashed flex items-center justify-center h-[70px]">
            <p className="text-secondary-400 italic text-[11px]">Trống</p>
          </div>
        )}

        {tracker.nextBooking ? (
          <div className="space-y-0.5 border-t border-border pt-2 mt-1 h-[55px]">
            <div className="flex justify-between items-center text-secondary-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">
              <span>Tiếp theo</span>
              <Link to={`/apps/bookings/${tracker.nextBooking.bookingId}`} className="text-primary-600 hover:underline">#{tracker.nextBooking.bookingCode}</Link>
            </div>
            <p className="font-medium text-foreground truncate text-[11px]" title={getTrackerGuestName(tracker.nextBooking.guestName)}>
               {getTrackerGuestName(tracker.nextBooking.guestName)}
            </p>
            <p className="text-secondary-400 text-[10px]">
              In: <span className="font-medium text-foreground">{formatDate(tracker.nextBooking.checkInAt, { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>
        ) : (
          <div className="border-t border-border pt-2 mt-1 flex items-center h-[55px]">
            <p className="text-secondary-400 italic text-[9px]">Chưa có khách tiếp theo</p>
          </div>
        )}

        {/* --- Time Slots Visualization --- */}
        {slots.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider mb-2">Lịch trình hôm nay</p>
            <div className="grid grid-cols-2 gap-1.5">
              {slots.map((slot) => {
                const isBooked = slot.status === 'BOOKED' || slot.status === 'PENDING';
                const timeRange = `${slot.timeSlot.startTime.split(':').slice(0,2).join(':')} - ${slot.timeSlot.endTime.split(':').slice(0,2).join(':')}`;
                return (
                  <div
                    key={slot.timeSlot.id}
                    className={cn(
                      "py-1 px-2 rounded-lg flex flex-col items-center justify-center border transition-all",
                      isBooked
                        ? "bg-danger-50 border-danger-100 text-danger-700 opacity-80"
                        : "bg-success-50 border-success-100 text-success-700 hover:bg-success-100"
                    )}
                    title={slot.status}
                  >
                    <span className="text-[9px] font-bold tracking-tight">{timeRange}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
