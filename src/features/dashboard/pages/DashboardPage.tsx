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
  Wallet,
  CreditCard,
  Banknote,
  Percent,
  TrendingDown,
  ChevronRight,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/shared/utils';
import { useDashboardStats, useRecentBookings, useUpcomingBookings, usePaymentStats } from '../hooks/useDashboard';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentBookings();
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingBookings();
  const { data: paymentStats, isLoading: paymentLoading } = usePaymentStats();

  const isLoading = statsLoading || recentLoading || upcomingLoading || paymentLoading;

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
        {/* --- Stats Row --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Đặt phòng hôm nay" 
            value={stats?.totalBookingsToday ?? 0}
            icon={CalendarCheck}
            color="primary"
            footer={
              <span className="text-xs font-medium text-success-600 flex items-center gap-1">
                <span className="font-semibold text-primary-600">{stats?.confirmedBookingsToday ?? 0}</span> đã xác nhận
              </span>
            }
          />
          
          <StatCard 
            title="Chờ thanh toán" 
            value={stats?.pendingBookingsToday ?? 0}
            icon={Clock}
            color="warning"
            footer={
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-warning-100">
                <div 
                  className="h-full bg-warning-400 rounded-full transition-all duration-500" 
                  style={{ width: stats?.totalBookingsToday ? `${(stats.pendingBookingsToday / stats.totalBookingsToday) * 100}%` : '0%' }}
                />
              </div>
            }
          />

          <StatCard 
            title="Doanh thu hôm nay" 
            value={formatCurrency(stats?.revenueToday ?? 0)}
            icon={TrendingUp}
            color="success"
            footer={<p className="text-xs text-secondary-400 italic">Cập nhật trực tiếp</p>}
          />

          <StatCard 
            title="Doanh thu tháng này" 
            value={formatCurrency(paymentStats?.revenueThisMonth ?? 0)}
            icon={CheckCircle}
            color="accent"
            footer={<p className="text-xs text-secondary-400 italic">Tăng trưởng ổn định</p>}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* --- Financial & Distribution Section --- */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Overview */}
            <div className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                 <Wallet className="h-32 w-32" />
              </div>
              <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary-500" />
                Tổng quan tài chính
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-secondary-400 mb-1">Lợi nhuận ròng (Net Revenue)</p>
                  <p className="text-3xl font-extrabold text-foreground tracking-tight">
                    {formatCurrency(paymentStats?.netRevenue ?? 0)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-success-50/50 border border-success-100">
                    <p className="text-[10px] font-bold text-success-600 uppercase mb-1">Đã thu</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(paymentStats?.totalPaidAmount ?? 0)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-danger-50/50 border border-danger-100">
                    <p className="text-[10px] font-bold text-danger-600 uppercase mb-1">Đã hoàn</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(paymentStats?.totalRefundedAmount ?? 0)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border border-dotted">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-secondary-500">Tỷ lệ hoàn tiền</span>
                      <span className="text-xs font-bold text-danger-500">{(paymentStats?.refundRate ?? 0).toFixed(1)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-secondary-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-danger-400 rounded-full" 
                        style={{ width: `${Math.min(paymentStats?.refundRate ?? 0, 100)}%` }}
                      />
                   </div>
                </div>
              </div>
            </div>

            {/* Distribution */}
            <div className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-accent-500" />
                Phân bổ phương thức
              </h3>
              
              <div className="space-y-5">
                {(paymentStats?.byMethod || []).length > 0 ? (
                  paymentStats?.byMethod.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-secondary-700">{item.key}</span>
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
                  ))
                ) : (
                  <div className="flex h-full items-center justify-center py-10 opacity-40">
                     <p className="text-xs italic">Chưa có dữ liệu phân bổ</p>
                  </div>
                )}
                
                <div className="mt-6 p-4 rounded-xl bg-surface-dim/50 border border-border border-dashed">
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

          {/* Growth & Actions Card */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-primary-100 text-primary-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full border border-success-100">
                  +12.5%
                </span>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider mb-1">Doanh thu tháng này</p>
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  {formatCurrency(paymentStats?.revenueThisMonth ?? 0)}
                </h3>
              </div>
              
              <div className="mt-auto flex flex-col gap-2">
                <Link 
                  to="/apps/bookings/create" 
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700 transition-all shadow-sm"
                >
                  TẠO BOOKING MỚI
                </Link>
                <Link 
                  to="/apps/invoices" 
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-secondary-50 text-secondary-600 font-bold text-xs hover:bg-secondary-100 transition-all border border-secondary-100"
                >
                  Chi tiết doanh thu
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* --- Recent Bookings --- */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface-dim px-6 py-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-primary-500" />
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Đặt phòng gần đây</h3>
              </div>
              <Link to="/apps/bookings" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
                Tất cả
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recent?.length ? (
                recent.slice(0, 5).map((booking) => (
                  <BookingListItem key={booking.bookingId} booking={booking} />
                ))
              ) : (
                <EmptyState message="Không có dữ liệu" />
              )}
            </div>
          </div>

          {/* --- Upcoming Check-ins --- */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface-dim px-6 py-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-accent-500" />
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Sắp check-in</h3>
              </div>
              <Link to="/apps/bookings" className="text-xs font-bold text-accent-600 hover:underline flex items-center gap-1">
                Lịch trình
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {upcoming?.length ? (
                upcoming.slice(0, 5).map((booking) => (
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
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-secondary-500 uppercase tracking-wider">{title}</p>
          <p className="mt-1 text-2xl font-black text-foreground tracking-tight group-hover:text-primary-600 transition-colors">
            {value}
          </p>
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-110', colorMapping[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-1">
        {footer}
      </div>
    </div>
  );
}

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
