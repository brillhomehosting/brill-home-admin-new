import { Header, PageWrapper } from '@/shared/components/layout';
import { Pagination } from '@/shared/components/ui';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/shared/utils';
import {
  Banknote,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Hourglass,
  Plus,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Types & Mock Data ---

type BookingStatus = 'Đã thanh toán' | 'Đang giữ chỗ' | 'Đã hủy' | 'Hoàn thành';

type Booking = {
  id: string;
  code: string;
  room: string;
  customerInitials: string;
  customerInitialsBg: string;
  customerName: string;
  phone: string;
  timeRange: string;
  timeSub: string;
  total: string;
  status: BookingStatus;
};

const mockBookings: Booking[] = [
  {
    id: '1',
    code: '#BK-A1F3C2',
    room: 'Cinema',
    customerInitials: 'NM',
    customerInitialsBg: 'bg-info-200 text-info-700',
    customerName: 'Nguyễn Thị Mai',
    phone: '0901234567',
    timeRange: '18:00 - 08:00',
    timeSub: 'Hôm nay',
    total: '850.000đ',
    status: 'Đã thanh toán',
  },
  {
    id: '2',
    code: '#BK-B2D4E5',
    room: 'Vintage',
    customerInitials: 'TH',
    customerInitialsBg: 'bg-warning-200 text-warning-700',
    customerName: 'Trần Văn Hùng',
    phone: '0912345678',
    timeRange: '14:00 - 18:00',
    timeSub: 'Hôm nay',
    total: '450.000đ',
    status: 'Đang giữ chỗ',
  },
  {
    id: '3',
    code: '#BK-C3E5F6',
    room: 'Neon',
    customerInitials: 'LH',
    customerInitialsBg: 'bg-purple-200 text-purple-700',
    customerName: 'Lê Thị Hoa',
    phone: '0987654321',
    timeRange: '22:00 - 08:00',
    timeSub: 'Hôm nay',
    total: '650.000đ',
    status: 'Đã thanh toán',
  },
  {
    id: '4',
    code: '#BK-D4F6A7',
    room: 'Rose',
    customerInitials: 'PT',
    customerInitialsBg: 'bg-danger-200 text-danger-700',
    customerName: 'Phạm Minh Tuấn',
    phone: '0933221100',
    timeRange: '14:00 - 22:00',
    timeSub: 'Hôm qua',
    total: '700.000đ',
    status: 'Đã hủy',
  },
  {
    id: '5',
    code: '#BK-E5A7B8',
    room: 'Cloud',
    customerInitials: 'HL',
    customerInitialsBg: 'bg-info-200 text-info-700',
    customerName: 'Hoàng Thị Lan',
    phone: '0945678901',
    timeRange: '18:00 - 22:00',
    timeSub: 'Hôm qua',
    total: '550.000đ',
    status: 'Hoàn thành',
  },
];

const renderStatusPill = (status: BookingStatus) => {
  let classes = '';
  switch (status) {
    case 'Đã thanh toán':
      classes = 'bg-success-100 text-success-700';
      break;
    case 'Đang giữ chỗ':
      classes = 'bg-warning-100 text-warning-700';
      break;
    case 'Đã hủy':
      classes = 'bg-danger-100 text-danger-700';
      break;
    case 'Hoàn thành':
      classes = 'bg-info-100 text-info-700';
      break;
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight', classes)}>
      {status}
    </span>
  );
};

export default function BookingListPage() {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [page, setPage] = useState(1);

  const tabs = [
    { label: 'Tất cả', count: 47 },
    { label: 'Cinema', count: null },
    { label: 'Vintage', count: null },
    { label: 'Neon', count: null },
    { label: 'Rose', count: null },
    { label: 'Cloud', count: null },
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
                <p className="mt-1 text-2xl font-bold text-foreground">12</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-medium text-success-600 flex items-center gap-1 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              +15% so với hôm qua
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Đang giữ chỗ</p>
                <p className="mt-1 text-2xl font-bold text-foreground">2</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 text-warning-500">
                <Hourglass className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-warning-100">
              <div className="h-full w-1/3 bg-warning-400 rounded-full" />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Chờ xử lý</p>
                <p className="mt-1 text-2xl font-bold text-foreground">5</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-50 text-indigo-500">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-secondary-400 mt-1">Cần xác nhận trong 24h</p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Doanh thu hôm nay</p>
                <p className="mt-1 text-2xl font-bold text-foreground">4.850.000đ</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-500">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-medium text-success-600 flex items-center gap-1 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              Đạt 85% mục tiêu
            </div>
          </div>
        </div>

        {/* --- Tabs --- */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={cn(
                    'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors',
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
                    className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="relative w-40 shrink-0">
                <select className="w-full appearance-none rounded-lg border border-border bg-transparent py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500">
                  <option>Tất cả trạng thái</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-secondary-400" />
              </div>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Tìm theo mã, tên KH, SĐT..."
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
                {mockBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-secondary-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <input type="checkbox" className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
                    </td>
                    <td className="px-5 py-4 font-medium">
                      <Link to={`/apps/bookings/${booking.code.replace('#BK-', '')}`} className="text-accent-500 hover:text-accent-600 hover:underline">
                        {booking.code}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{booking.room}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold', booking.customerInitialsBg)}>
                          {booking.customerInitials}
                        </div>
                        <span className="font-medium text-foreground">{booking.customerName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-secondary-600">{booking.phone}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{booking.timeRange}</p>
                      <p className="text-xs text-secondary-400">{booking.timeSub}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">{booking.total}</td>
                    <td className="px-5 py-4 text-center">
                      {renderStatusPill(booking.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-border px-4 py-4 sm:px-6">
            <Pagination
              currentPage={page}
              totalPages={8}
              onPageChange={setPage}
              summary="Hiển thị 5 / 47 kết quả"
            />
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
