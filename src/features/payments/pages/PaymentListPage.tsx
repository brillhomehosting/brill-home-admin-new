import { useState, useMemo, useEffect } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Pagination } from '@/shared/components/ui';
import { cn, formatCurrency, formatDate } from '@/shared/utils';
import {
  CalendarDays,
  ChevronDown,
  Search,
  Download,
  Banknote,
  Calendar,
  Hourglass,
  RefreshCcw,
  Loader2,
  ExternalLink,
  User,
  Clock,
  MapPin,
  X,
} from 'lucide-react';
import { ROUTES } from '@/shared/constants';
import { usePayments } from '../hooks/usePayments';
import { useBookingByCode } from '@/features/bookings/hooks/useBookings';
import type { Payment, PaymentStatus } from '@/shared/types';

// --- Components ---

function BookingDetailPanel({ bookingCode, onClose }: { bookingCode: string; onClose: () => void }) {
  const { data: booking, isLoading } = useBookingByCode(bookingCode);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-border bg-surface p-8 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <p className="mt-4 text-sm font-medium text-secondary-500">Đang tìm thông tin booking...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-border bg-surface p-8 shadow-sm">
        <X className="h-8 w-8 text-danger-500" />
        <p className="mt-4 text-sm font-medium text-secondary-500">Không tìm thấy booking #{bookingCode}</p>
        <button onClick={onClose} className="mt-2 text-xs text-accent-500 underline">Đóng</button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between border-b border-border bg-secondary-50/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground">Chi tiết Booking</h3>
          <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-600">
            #{booking.bookingCode}
          </span>
        </div>
        <button onClick={onClose} className="rounded-full p-1 text-secondary-400 hover:bg-secondary-100 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Guest Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary-500">
            <User className="h-3.5 w-3.5" />
            Khách hàng
          </div>
          <div className="rounded-lg border border-border bg-secondary-50/30 p-3">
            <p className="font-bold text-sm text-foreground">{booking.guestName}</p>
            <p className="mt-0.5 text-xs text-secondary-500">{booking.guestPhone}</p>
          </div>
        </div>

        {/* Room Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary-500">
            <MapPin className="h-3.5 w-3.5" />
            Phòng & Thời gian
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-secondary-400">Tên phòng</p>
              <p className="text-sm font-bold text-foreground">{booking.roomName}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-xs font-medium text-secondary-400">Ngày đặt</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(booking.date)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-secondary-400">Check-in</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(booking.checkInAt, { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary-500">
            <Banknote className="h-3.5 w-3.5" />
            Thanh toán
          </div>
          <div className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-secondary-500">Tổng cộng</span>
              <span className="font-bold text-foreground">{formatCurrency(booking.finalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary-500">Trạng thái</span>
              <span className={cn(
                "rounded-full px-2 py-0.5 font-bold uppercase text-[9px]",
                booking.status === 'SUCCESS' ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
              )}>
                {booking.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-3 bg-secondary-50/50">
        <a 
          href={`/apps/bookings/${booking.bookingId}`} 
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-surface py-2 text-xs font-bold text-accent-500 border border-accent-200 hover:bg-accent-50 transition-colors"
        >
          Xem chi tiết đầy đủ
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

// --- Main Page ---

const statusMapping: Record<string, { label: string; classes: string }> = {
  SUCCESS: { label: 'Thành công', classes: 'bg-success-100 text-success-700' },
  PENDING: { label: 'Chờ duyệt', classes: 'bg-warning-100 text-warning-700' },
  FAILED: { label: 'Thất bại', classes: 'bg-danger-100 text-danger-700' },
};

export default function PaymentListPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | undefined>(undefined);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: response, isLoading } = usePayments({
    page,
    size,
    search: debouncedSearch,
    status,
  });

  const payments = response?.content || [];
  const totalElements = response?.totalElements || 0;
  const totalPages = response?.totalPages || 0;

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Quản lý thanh toán"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Thanh toán' },
        ]} 
        actions={
          <button className="flex items-center gap-2 rounded-lg bg-accent-400 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-500 transition-colors">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </button>
        }
      />

      <PageWrapper className="flex-1 space-y-6">
        
        {/* Main Content Area: Split View */}
        <div className="flex flex-col lg:flex-row gap-6 h-full items-start">
          
          {/* Booking Detail Panel (Conditional on Selection) */}
          {selectedPayment && (
            <div className="w-full lg:w-[320px] shrink-0 h-[calc(100vh-250px)] sticky top-6">
              <BookingDetailPanel 
                bookingCode={selectedPayment.bookingCode} 
                onClose={() => setSelectedPayment(null)} 
              />
            </div>
          )}

          {/* Payment List Section */}
          <div className="flex-1 flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden min-w-0">
            
            {/* Filters */}
            <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-40">
                  <select 
                    value={status || ''}
                    onChange={(e) => {
                      setStatus((e.target.value as PaymentStatus) || undefined);
                      setPage(0);
                    }}
                    className="w-full appearance-none rounded-lg border border-border bg-transparent py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="SUCCESS">Thành công</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Thất bại</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-secondary-400" />
                </div>

                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Tìm mã GD, mã booking..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-secondary-200">
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-dim uppercase text-secondary-500 text-[10px] font-bold tracking-widest border-b border-border">
                  <tr>
                    <th scope="col" className="px-5 py-4">Mã giao dịch</th>
                    <th scope="col" className="px-5 py-4">Mã booking</th>
                    <th scope="col" className="px-5 py-4">Cổng thanh toán</th>
                    <th scope="col" className="px-5 py-4">Số tiền</th>
                    <th scope="col" className="px-5 py-4 text-center">Trạng thái</th>
                    <th scope="col" className="px-5 py-4 text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto" />
                        <p className="mt-2 text-secondary-400">Đang tải lịch sử thanh toán...</p>
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-secondary-500">
                        Không có dữ liệu thanh toán nào.
                      </td>
                    </tr>
                  ) : (
                    payments.map((pm) => {
                      const isSelected = selectedPayment?.paymentCode === pm.paymentCode;
                      const status = statusMapping[pm.paymentStatus] || { label: pm.paymentStatus, classes: 'bg-secondary-100' };

                      return (
                        <tr 
                          key={pm.paymentCode} 
                          onClick={() => setSelectedPayment(isSelected ? null : pm)}
                          className={cn(
                            "hover:bg-secondary-50/50 cursor-pointer transition-all",
                            isSelected ? "bg-accent-50/50 ring-1 ring-inset ring-accent-400" : ""
                          )}
                        >
                          <td className="px-5 py-4 font-bold text-foreground font-mono text-xs">
                            {pm.transactionNo || pm.gatewayOrderId || pm.paymentCode}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-accent-500">#{pm.bookingCode}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-secondary-700">
                              <Banknote className="h-3.5 w-3.5 text-secondary-400" />
                              {pm.paymentMethod}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-black text-foreground">
                            {formatCurrency(pm.amount)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-tight', status.classes)}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right text-secondary-500 font-medium">
                            {formatDate(pm.createdAt, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-border px-4 py-4 sm:px-6 mt-auto">
              <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
                summary={`Hiển thị ${payments.length} / ${totalElements} kết quả`}
              />
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
