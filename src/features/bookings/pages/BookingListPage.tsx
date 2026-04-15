import { Header, PageWrapper } from '@/shared/components/layout';
import { Pagination } from '@/shared/components/ui';
import { ROUTES } from '@/shared/constants';
import { cn, formatDate, formatCurrency } from '@/shared/utils';
import {
  Banknote,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Hourglass,
  Plus,
  Search,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useDashboardStats } from '../hooks/useDashboardStats';
import type { BookingStatus } from '@/shared/types';

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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight',
        config.classes,
      )}
    >
      {config.label}
    </span>
  );
};

export default function BookingListPage() {
  const [page, setPage] = useState(0); // API is 0-indexed typically
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
      count: null, // API doesn't provide count per room easily in one call
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
          <Link
            to="/apps/bookings/create"
            className="flex items-center gap-2 rounded-lg bg-accent-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-500"
          >
            <Plus className="h-4 w-4" />
            Tạo booking thủ công
          </Link>
        }
      />

      <PageWrapper className="flex-1 space-y-6">
        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Booking hôm nay</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stats?.totalBookingsToday ?? 0}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-medium text-success-600 flex items-center gap-1 mt-1">
              <span className="font-semibold text-primary-600">{stats?.confirmedBookingsToday ?? 0}</span> đã xác nhận
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Đang giữ chỗ</p>
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
                <p className="text-sm font-medium text-secondary-500">Chờ duyệt CCCD</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stats?.pendingCccdCount ?? 0}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-50 text-indigo-500">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-secondary-400 mt-1">Cần hậu kiểm thông tin khách</p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Doanh thu hôm nay</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.revenueToday ?? 0)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-500">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-medium text-success-600 flex items-center gap-1 mt-1 text-right italic">
              Cập nhật lúc: {stats?.date ? formatDate(stats.date) : '...'}
            </div>
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
                    'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-accent-400 text-accent-500'
                      : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700',
                  )}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs',
                        isActive
                          ? 'bg-accent-50 text-accent-600'
                          : 'bg-secondary-100 text-secondary-600',
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
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm">
          {/* Filters */}
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative w-36 shrink-0">
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
                <div className="relative w-36 shrink-0">
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
              <div className="relative w-40 shrink-0">
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
              <div className="relative w-full max-w-sm">
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
            <button className="flex items-center gap-2 rounded-lg bg-secondary-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-800">
              Tìm kiếm
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-4 w-12">
                    <input type="checkbox" className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
                  </th>
                  <th scope="col" className="px-5 py-4">Mã Booking</th>
                  <th scope="col" className="px-5 py-4">Phòng</th>
                  <th scope="col" className="px-5 py-4">Khách hàng</th>
                  <th scope="col" className="px-5 py-4">SĐT</th>
                  <th scope="col" className="px-5 py-4">Thời gian</th>
                  <th scope="col" className="px-5 py-4">Tổng tiền</th>
                  <th scope="col" className="px-5 py-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                        <span className="text-sm text-secondary-500 font-medium">Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-secondary-500 font-medium">
                      Không tìm thấy booking nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.bookingId} className="hover:bg-secondary-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <input type="checkbox" className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
                      </td>
                      <td className="px-5 py-4 font-medium">
                        <Link
                          to={`/apps/bookings/${booking.bookingId}`}
                          className="text-accent-500 hover:text-accent-600 hover:underline inline-block max-w-[120px] truncate align-bottom"
                          title={booking.bookingCode}
                        >
                          #{booking.bookingCode}
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-medium text-foreground">{booking.roomName}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold bg-info-200 text-info-700')}>
                            {booking.guestName.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{booking.guestName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-secondary-600">{booking.guestPhone}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">
                          {formatDate(booking.checkInAt, { hour: '2-digit', minute: '2-digit', hour12: false })} -{' '}
                          {formatDate(booking.checkOutAt, { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </p>
                        <p className="text-xs text-secondary-400">{formatDate(booking.date)}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-foreground">{formatCurrency(booking.finalAmount)}</td>
                      <td className="px-5 py-4 text-center">
                        {renderStatusPill(booking.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
