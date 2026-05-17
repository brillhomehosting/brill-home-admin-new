import { Header, PageWrapper } from '@/shared/components/layout';
import { DateInput, Pagination, Select } from '@/shared/components/ui';
import { ROUTES } from '@/shared/constants';
import { cn, formatCurrency } from '@/shared/utils';
import {
  Banknote,
  CalendarDays,
  Plus,
  Search,
  Loader2,
  Hourglass,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboard';
import type { BookingStatus } from '@/shared/types';
import { Button } from '@/shared/components/ui/Button';
import { BookingListCard } from '../components/BookingCard';

// --- Types ---

export default function BookingListPage() {
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <MiniStatCard
            label="Booking hôm nay"
            value={stats?.confirmedBookingsToday ?? 0}
            sub="Đã xác nhận"
            subColor="text-success-600"
            icon={CalendarDays}
            iconBg="bg-primary-50 text-primary-500"
          />
          <MiniStatCard
            label="Phòng có khách"
            value={stats?.occupiedRooms ?? 0}
            sub={`${stats?.vacantRooms ?? 0} phòng trống`}
            subColor="text-secondary-500"
            icon={Hourglass}
            iconBg="bg-warning-50 text-warning-500"
          />
          <MiniStatCard
            label="Doanh thu hôm nay"
            value={formatCurrency(stats?.revenueToday ?? 0)}
            sub="Cập nhật trực tiếp"
            subColor="text-success-600"
            icon={Banknote}
            iconBg="bg-success-50 text-success-500"
          />
          <MiniStatCard
            label="Phòng hoạt động"
            value={rooms.length}
            sub="Danh sách phòng"
            subColor="text-secondary-400"
            icon={CalendarDays}
            iconBg="bg-secondary-50 text-secondary-500"
          />
        </div>

        {/* --- Tabs --- */}
        <div className="border-b border-border overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <nav className="-mb-px flex space-x-4 sm:space-x-6">
            {tabs.map((tab) => {
              const isActive = selectedRoomId === tab.id;
              return (
                <button
                  key={tab.label}
                  onClick={() => { setSelectedRoomId(tab.id); setPage(0); }}
                  className={cn(
                    'flex items-center gap-1.5 border-b-2 px-1 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap uppercase tracking-tight',
                    isActive
                      ? 'border-accent-400 text-accent-500'
                      : 'border-transparent text-secondary-400 hover:border-secondary-300 hover:text-secondary-600',
                  )}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className={cn(
                      'rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                      isActive ? 'bg-accent-50 text-accent-600' : 'bg-secondary-100 text-secondary-500',
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* --- Filters Section --- */}
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {/* Date from */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-secondary-400">Từ ngày</label>
              <DateInput
                value={startDate}
                onChange={(value) => { setStartDate(value); setPage(0); }}
                className="h-9 rounded-lg text-xs sm:text-sm"
              />
            </div>

            {/* Date to */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-secondary-400">Đến ngày</label>
              <DateInput
                value={endDate}
                onChange={(value) => { setEndDate(value); setPage(0); }}
                className="h-9 rounded-lg text-xs sm:text-sm"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-secondary-400">Trạng thái</label>
              <Select
                value={status || ''}
                onChange={(e) => { setStatus((e.target.value as BookingStatus) || undefined); setPage(0); }}
                options={[
                  { value: '', label: 'Tất cả' },
                  { value: 'CONFIRMED', label: 'Đã xác nhận' },
                  { value: 'CANCELLED', label: 'Đã hủy' },
                ]}
                className="h-9 !text-secondary-950 text-xs sm:text-sm"
              />
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-secondary-400">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Mã, Tên, SĐT..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-surface py-2 pl-8 pr-2 text-xs sm:text-sm font-medium outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 !text-secondary-950"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Booking List --- */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-dim/50 px-4 py-3">
            <div className="text-sm font-bold text-foreground">
              Bảng đặt phòng
            </div>
            <span className="text-xs font-semibold text-secondary-500">
              {totalElements} kết quả
            </span>
          </div>

          {/* Desktop Header */}
          <div className="hidden border-b-2 border-border bg-secondary-50 px-5 py-3.5 md:grid md:grid-cols-[minmax(220px,1.2fr)_minmax(150px,1fr)_minmax(180px,1fr)_minmax(140px,1fr)_minmax(120px,0.8fr)_40px] gap-4 items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-secondary-600">Khách hàng</span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-secondary-600">Phòng & Mã</span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-secondary-600">Lưu trú</span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-secondary-600">Trạng thái</span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-secondary-600 text-right">Tổng tiền</span>
            <span />
          </div>

          <div className="px-2 py-2 md:px-3 md:py-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                <span className="text-sm font-medium text-secondary-500">Đang tải dữ liệu...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center text-secondary-500 text-sm font-medium">
                Không tìm thấy booking nào phù hợp.
              </div>
            ) : (
              bookings.map((booking, index) => (
                <BookingListCard key={booking.bookingId} booking={booking} index={index} />
              ))
            )}
          </div>

          <div className="border-t border-border px-4 py-4 sm:px-6 bg-surface">
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

function MiniStatCard({ label, value, sub, subColor, icon: Icon, iconBg }: {
  label: string;
  value: string | number;
  sub: string;
  subColor: string;
  icon: any;
  iconBg: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-3 sm:p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-secondary-400 leading-tight">{label}</p>
          <p className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-bold text-foreground truncate">{value}</p>
        </div>
        <div className={cn('flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg', iconBg)}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
      <p className={cn('text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter', subColor)}>{sub}</p>
    </div>
  );
}
