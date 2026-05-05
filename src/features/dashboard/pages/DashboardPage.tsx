import { Header, PageWrapper } from '@/shared/components/layout';
import { 
  TrendingUp, 
  CalendarCheck, 
  Clock, 
  ArrowRight,
  Loader2,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Home,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/shared/utils';
import { useDashboardStats, useRecentBookings, useUpcomingBookings } from '../hooks/useDashboard';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentBookings();
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingBookings();

  const isLoading = statsLoading || recentLoading || upcomingLoading;

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

      <PageWrapper className="flex-1 space-y-6 pt-6 pb-10">
        {/* --- Stats Row (Simple Cards like Booking List) --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Đặt phòng hôm nay</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stats?.totalBookingsToday ?? 0}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                <CalendarCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-medium text-success-600 flex items-center gap-1 mt-1">
              <span className="font-semibold text-primary-600">{stats?.confirmedBookingsToday ?? 0}</span> đã xác nhận
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Chờ thanh toán</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stats?.pendingBookingsToday ?? 0}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 text-warning-500">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-warning-100">
              <div 
                className="h-full bg-warning-400 rounded-full" 
                style={{ width: stats?.totalBookingsToday ? `${(stats.pendingBookingsToday / stats.totalBookingsToday) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Doanh thu hôm nay</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{formatCurrency(stats?.revenueToday ?? 0)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-500">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-secondary-400 mt-1 italic">Cập nhật trực tiếp</p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Đã xác nhận</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stats?.confirmedBookingsToday ?? 0}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-500">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-secondary-400 mt-1 italic">Hoạt động ổn định</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* --- Recent Bookings --- */}
          <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-primary-500" />
                <h3 className="font-bold text-foreground text-sm">Đặt phòng gần đây</h3>
              </div>
              <Link to="/apps/bookings" className="text-xs font-medium text-primary-600 hover:underline flex items-center gap-1">
                Xem tất cả
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recent?.length ? (
                recent.map((booking) => (
                  <BookingListItem key={booking.bookingId} booking={booking} />
                ))
              ) : (
                <EmptyState message="Không có dữ liệu" />
              )}
            </div>
          </div>

          {/* --- Upcoming Check-ins --- */}
          <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-accent-500" />
                <h3 className="font-bold text-foreground text-sm">Sắp check-in</h3>
              </div>
              <Link to="/apps/bookings" className="text-xs font-medium text-accent-600 hover:underline flex items-center gap-1">
                Xem lịch
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {upcoming?.length ? (
                upcoming.map((booking) => (
                  <BookingListItem key={booking.bookingId} booking={booking} />
                ))
              ) : (
                <EmptyState message="Không có dữ liệu" />
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

// ── Components ──

function BookingListItem({ booking }: { booking: any }) {
  const statusMapping: Record<string, { label: string; classes: string }> = {
    PENDING: { label: 'Chờ TT', classes: 'bg-warning-100 text-warning-700' },
    SUCCESS: { label: 'Đã TT', classes: 'bg-success-100 text-success-700' },
    CONFIRMED: { label: 'Đã xác nhận', classes: 'bg-primary-100 text-primary-700' },
    CANCELLED: { label: 'Đã hủy', classes: 'bg-danger-100 text-danger-700' },
  };

  const status = statusMapping[booking.status] || { label: booking.status, classes: 'bg-secondary-100 text-secondary-700' };

  return (
    <Link 
      to={`/apps/bookings/${booking.bookingId}`}
      className="group flex items-center justify-between px-5 py-3 hover:bg-secondary-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-100 text-secondary-500 group-hover:bg-white transition-all">
          <Home className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-foreground">#{booking.bookingCode}</p>
            <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold uppercase', status.classes)}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-secondary-500">{booking.guestName} · {booking.roomName}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-sm text-foreground">{formatCurrency(booking.finalAmount)}</p>
        <p className="text-[10px] text-secondary-400 flex items-center justify-end gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(booking.checkInAt, { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </Link>
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
