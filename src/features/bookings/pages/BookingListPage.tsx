import { Header, PageWrapper } from '@/shared/components/layout';
import { Pagination } from '@/shared/components/ui';
import { ROUTES } from '@/shared/constants';
import { cn, formatDate, formatCurrency } from '@/shared/utils';
import {
  Banknote,
  CalendarDays,
  ChevronDown,
  Plus,
  Search,
  Loader2,
  Hourglass,
  User,
  Home,
  Clock,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboard';
import type { BookingStatus } from '@/shared/types';
import { Button } from '@/shared/components/ui/Button';

// --- Types ---

const statusMapping: Record<BookingStatus, { label: string; classes: string }> = {
  PENDING: {
    label: 'Đang giữ chỗ',
    classes: 'bg-warning-100 text-warning-700',
  },
  SUCCESS: {
    label: 'Đã thanh toán',
    classes: 'bg-success-100 text-success-700',
  },
  CANCELLED: { label: 'Đã hủy', classes: 'bg-danger-100 text-danger-700' },
  COMPLETED: { label: 'Hoàn thành', classes: 'bg-info-100 text-info-700' },
  CONFIRMED: {
    label: 'Đã xác nhận',
    classes: 'bg-primary-100 text-primary-700',
  },
};

const renderStatusPill = (status: BookingStatus) => {
  const config = statusMapping[status] || {
    label: status,
    classes: 'bg-secondary-100 text-secondary-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight',
        config.classes,
      )}
    >
      {config.label}
    </span>
  );
};

export default function BookingListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0); 
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<BookingStatus | undefined>(undefined);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);

  const { data: roomsResponse } = useRooms({ limit: 100 });
  const rooms = roomsResponse?.data.content || [];

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const { data: stats } = useDashboardStats();

  const { data: response, isLoading } = useBookings({
    page,
    size,
    search: debouncedSearch,
    status,
    startDate,
    endDate,
    roomId: selectedRoomId,
  });

  const bookings = response?.data.content || [];
  const totalElements = response?.data.totalElements || 0;
  const totalPages = response?.data.totalPages || 0;

  const tabs = [
    { id: undefined, label: 'Tất cả', count: totalElements },
    ...rooms.map((room) => ({
      id: room.id,
      label: room.name,
      count: null, 
    })),
  ];

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Quản lý đặt phòng"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Đặt phòng' },
        ]}
        actions={
          <Link to={ROUTES.BOOKINGS.NEW}>
            <Button
              className="bg-accent-400 hover:bg-accent-500"
              icon={Plus}
            >
              Tạo booking
            </Button>
          </Link>
        }
      />

      <PageWrapper className="flex-1 space-y-6">
        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Booking hôm nay</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stats?.totalBookingsToday ?? 0}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <div className="text-[10px] font-bold text-success-600 flex items-center gap-1 mt-1 uppercase tracking-tighter">
              <span className="font-extrabold">{stats?.confirmedBookingsToday ?? 0}</span> đã xác nhận
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Đang giữ chỗ</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stats?.pendingBookingsToday ?? 0}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 text-warning-500">
                <Hourglass className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-warning-100">
              <div 
                className="h-full bg-warning-400 rounded-full transition-all duration-500" 
                style={{ width: stats?.totalBookingsToday ? `${(stats.pendingBookingsToday / stats.totalBookingsToday) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Doanh thu hôm nay</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.revenueToday ?? 0)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-500">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
            <div className="text-[10px] font-bold text-success-600 flex items-center gap-1 mt-1 italic uppercase tracking-tighter">
              Cập nhật trực tiếp
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Phòng hoạt động</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {rooms.length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-50 text-info-500">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-secondary-400 mt-1 italic uppercase tracking-tighter">Dựa trên danh sách</p>
          </div>
        </div>

        {/* --- Tabs --- */}
        <div className="border-b border-border overflow-x-auto scrollbar-hide">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab) => {
              const isActive = selectedRoomId === tab.id;
              return (
                <button
                  key={tab.label}
                  onClick={() => {
                    setSelectedRoomId(tab.id);
                    setPage(0);
                  }}
                  className={cn(
                    'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-bold transition-colors whitespace-nowrap uppercase tracking-tight',
                    isActive
                      ? 'border-accent-400 text-accent-500'
                      : 'border-transparent text-secondary-400 hover:border-secondary-300 hover:text-secondary-600',
                  )}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                        isActive
                          ? 'bg-accent-50 text-accent-600'
                          : 'bg-secondary-100 text-secondary-500',
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* --- Table Section --- */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex flex-col gap-4 border-b border-border p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 lg:col-span-1">
                <div className="relative flex-1">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Từ ngày"
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(0);
                    }}
                    className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                  />
                </div>
                <span className="text-secondary-400 font-medium">-</span>
                <div className="relative flex-1">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Đến ngày"
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(0);
                    }}
                    className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="relative">
                <select
                  value={status || ''}
                  onChange={(e) => {
                    setStatus((e.target.value as BookingStatus) || undefined);
                    setPage(0);
                  }}
                  className="w-full appearance-none rounded-lg border border-border bg-transparent py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PENDING">Đang giữ chỗ</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="SUCCESS">Đã thanh toán</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-secondary-400" />
              </div>
              <div className="relative sm:col-span-2 lg:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Tìm theo mã, tên KH, SĐT..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-400">
                Tìm thấy {totalElements} booking
              </span>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider border-b border-border">
                <tr>
                  <th scope="col" className="px-5 py-4">Mã Booking</th>
                  <th scope="col" className="px-5 py-4 text-center">Trạng thái</th>
                  <th scope="col" className="px-5 py-4">Phòng</th>
                  <th scope="col" className="px-5 py-4">Khách hàng</th>
                  <th scope="col" className="px-5 py-4">SĐT</th>
                  <th scope="col" className="px-5 py-4">Thời gian</th>
                  <th scope="col" className="px-5 py-4 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-secondary-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                        <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-secondary-500 font-medium">
                      Không tìm thấy booking nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.bookingId} className="hover:bg-secondary-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/apps/bookings/${booking.bookingId}`)}>
                      <td className="px-5 py-4">
                        <Link
                          to={`/apps/bookings/${booking.bookingId}`}
                          className="text-sm font-bold text-primary-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          #{booking.bookingCode}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {renderStatusPill(booking.status)}
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">{booking.roomName}</td>
                      <td className="px-5 py-4 font-medium text-foreground">{booking.guestName}</td>
                      <td className="px-5 py-4 text-secondary-600 font-medium">{booking.guestPhone}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-foreground text-xs">
                          {formatDate(booking.checkInAt, { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {formatDate(booking.checkOutAt, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-tighter">{formatDate(booking.date)}</p>
                      </td>
                      <td className="px-5 py-4 text-right font-extrabold text-foreground">{formatCurrency(booking.finalAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {isLoading ? (
              <div className="px-5 py-10 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="px-5 py-10 text-center text-secondary-500 text-sm">
                Không tìm thấy booking.
              </div>
            ) : (
              bookings.map((booking) => (
                <Link 
                  key={booking.bookingId} 
                  to={`/apps/bookings/${booking.bookingId}`}
                  className="flex flex-col p-4 gap-3 bg-surface hover:bg-secondary-50 active:bg-secondary-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                        <Home className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">#{booking.bookingCode}</p>
                        <p className="text-[10px] text-secondary-400 font-bold uppercase">{booking.roomName}</p>
                      </div>
                    </div>
                    {renderStatusPill(booking.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-secondary-600">
                      <User className="h-3.5 w-3.5 text-secondary-400" />
                      <span className="text-xs font-bold">{booking.guestName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-accent-600 font-extrabold text-sm">
                      <Banknote className="h-3.5 w-3.5" />
                      {formatCurrency(booking.finalAmount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-bold text-secondary-400 uppercase tracking-tighter border-t border-border pt-2">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(booking.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(booking.checkInAt, { hour: '2-digit', minute: '2-digit' })} - {formatDate(booking.checkOutAt, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="border-t border-border px-4 py-4 sm:px-6">
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
              summary={`Hiển thị ${bookings.length} / ${totalElements} kết quả`}
            />
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
