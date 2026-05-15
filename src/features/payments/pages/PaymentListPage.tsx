import { useState, useEffect } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Pagination, Select } from '@/shared/components/ui';
import { cn, formatCurrency, formatDate } from '@/shared/utils';
import {
  Search,
  Banknote,
  Loader2,
  ExternalLink,
  User,
  MapPin,
  X,
  Receipt,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { usePayments } from '../hooks/usePayments';
import { useBookingByCode } from '@/features/bookings/hooks/useBookings';
import type { Payment, PaymentMethod, PaymentStatus } from '@/shared/types';

// --- Slide-over Detail Panel (overlays on the RIGHT) ---

function BookingDetailPanel({ bookingCode, onClose }: { bookingCode: string; onClose: () => void }) {
  const { data: booking, isLoading } = useBookingByCode(bookingCode);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-overlay bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-modal w-full max-w-sm flex flex-col bg-surface shadow-xl border-l border-border animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Chi tiết Booking</h3>
            <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-600">
              #{bookingCode}
            </span>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-secondary-400 hover:bg-secondary-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <p className="text-sm text-secondary-500">Đang tải...</p>
          </div>
        ) : !booking ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <X className="h-8 w-8 text-danger-400" />
            <p className="text-sm text-secondary-500">Không tìm thấy booking</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Guest */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-400">
                  <User className="h-3.5 w-3.5" />
                  Khách hàng
                </div>
                <div className="rounded-lg border border-border bg-secondary-50/30 p-3">
                  <p className="font-medium text-sm text-foreground">{booking.guestName}</p>
                  <p className="mt-0.5 text-xs text-secondary-500">{booking.guestPhone}</p>
                </div>
              </div>

              {/* Room */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Phòng & Thời gian
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-secondary-400">Tên phòng</p>
                    <p className="text-sm font-medium text-foreground">{booking.roomName}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-secondary-400">Ngày đặt</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(booking.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-400">Check-in</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(booking.checkInAt, { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-400">
                  <Banknote className="h-3.5 w-3.5" />
                  Thanh toán
                </div>
                <div className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary-500">Tổng cộng</span>
                    <span className="font-semibold text-foreground">{formatCurrency(booking.finalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary-500">Trạng thái</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 font-semibold text-[10px]",
                      booking.status === 'CONFIRMED' ? 'bg-primary-100 text-primary-700' : 'bg-danger-100 text-danger-700'
                    )}>
                      {booking.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đã hủy'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 bg-surface-dim">
              <Link 
                to={`/apps/bookings/${booking.bookingId}`} 
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-surface py-2.5 text-xs font-medium text-accent-500 border border-accent-200 hover:bg-accent-50 transition-colors"
              >
                Xem chi tiết đầy đủ
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// --- Main Page ---

const statusMapping: Record<string, { label: string; classes: string }> = {
  PAID: { label: 'Đã thanh toán', classes: 'bg-success-100 text-success-700' },
  REFUNDED: { label: 'Đã hoàn tiền', classes: 'bg-warning-100 text-warning-700' },
};

const methodMapping: Record<PaymentMethod, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  OTHER: 'Khác',
};

export default function PaymentListPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(undefined);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

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
    paymentMethod,
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
      />

      <PageWrapper className="flex-1 space-y-6">
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-5 bg-surface/50">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Select
                value={status || ''}
                onChange={(e) => {
                  setStatus((e.target.value as PaymentStatus) || undefined);
                  setPage(0);
                }}
                options={[
                  { value: '', label: 'Trạng thái' },
                  { value: 'PAID', label: 'Đã thanh toán' },
                  { value: 'REFUNDED', label: 'Đã hoàn tiền' },
                ]}
                className="h-10"
              />
              <Select
                value={paymentMethod || ''}
                onChange={(e) => {
                  setPaymentMethod((e.target.value as PaymentMethod) || undefined);
                  setPage(0);
                }}
                options={[
                  { value: '', label: 'Phương thức' },
                  { value: 'CASH', label: 'Tiền mặt' },
                  { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
                  { value: 'OTHER', label: 'Khác' },
                ]}
                className="h-10"
              />
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Mã giao dịch, mã booking..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-base sm:text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                />
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 px-1 sm:px-0">
               <span className="text-[11px] font-bold text-secondary-400 uppercase tracking-wider">
                 Tổng số: {totalElements}
               </span>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider border-b border-border">
                <tr>
                  <th scope="col" className="px-5 py-4">Mã giao dịch</th>
                  <th scope="col" className="px-5 py-4">Mã booking</th>
                  <th scope="col" className="px-5 py-4">Phương thức</th>
                  <th scope="col" className="px-5 py-4 text-right">Số tiền</th>
                  <th scope="col" className="px-5 py-4 text-center">Trạng thái</th>
                  <th scope="col" className="px-5 py-4 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-secondary-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                        <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-secondary-500 font-medium">
                      Không có dữ liệu thanh toán nào.
                    </td>
                  </tr>
                ) : (
                  payments.map((pm) => {
                    const isSelected = selectedPayment?.paymentCode === pm.paymentCode;
                    const pmStatus = statusMapping[pm.paymentStatus] || { label: pm.paymentStatus, classes: 'bg-secondary-100 text-secondary-700' };

                    return (
                      <tr 
                        key={pm.paymentCode} 
                        onClick={() => setSelectedPayment(isSelected ? null : pm)}
                        className={cn(
                          "hover:bg-secondary-50/50 cursor-pointer transition-colors",
                          isSelected ? "bg-accent-50/50" : ""
                        )}
                      >
                        <td className="px-5 py-4">
                          <span className="inline-block max-w-[120px] truncate text-sm text-secondary-600" title={pm.transactionNo || pm.gatewayOrderId || pm.paymentCode}>
                            {pm.transactionNo || pm.gatewayOrderId || pm.paymentCode}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block max-w-[120px] truncate text-sm text-primary-600 font-medium" title={pm.bookingCode}>
                            #{pm.bookingCode}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm text-secondary-700">
                            <Banknote className="h-3.5 w-3.5 text-secondary-400" />
                            {methodMapping[pm.paymentMethod] || pm.paymentMethod}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-foreground">
                          {formatCurrency(pm.amount)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight', pmStatus.classes)}>
                            {pmStatus.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-sm text-secondary-500">
                          {formatDate(pm.createdAt, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-border">
            {isLoading ? (
              <div className="px-5 py-10 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto" />
              </div>
            ) : payments.length === 0 ? (
              <div className="px-5 py-10 text-center text-secondary-500 text-sm">
                Không có dữ liệu thanh toán.
              </div>
            ) : (
              payments.map((pm) => {
                const isSelected = selectedPayment?.paymentCode === pm.paymentCode;
                const pmStatus = statusMapping[pm.paymentStatus] || { label: pm.paymentStatus, classes: 'bg-secondary-100 text-secondary-700' };

                return (
                  <div
                    key={pm.paymentCode}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 bg-surface hover:bg-secondary-50 transition-colors cursor-pointer relative",
                      isSelected && "bg-accent-50/50"
                    )}
                    onClick={() => setSelectedPayment(isSelected ? null : pm)}
                  >
                    {/* status bar */}
                    <div className={cn(
                      'absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full',
                      pm.paymentStatus === 'PAID' ? 'bg-success-400' : 'bg-warning-400'
                    )} />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 border border-primary-100">
                      <Receipt className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-bold text-foreground text-sm truncate">#{pm.bookingCode}</span>
                        <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0', pmStatus.classes)}>
                          {pmStatus.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary-500 truncate">
                        {methodMapping[pm.paymentMethod] || pm.paymentMethod} · <span className="text-secondary-400 font-medium">{pm.transactionNo || pm.paymentCode}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-secondary-400">
                          {formatDate(pm.createdAt, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right self-start pt-0.5">
                      <p className="font-black text-sm text-foreground">{formatCurrency(pm.amount)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="border-t border-border px-4 py-4 sm:px-6">
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
              summary={`Hiển thị ${payments.length} / ${totalElements} kết quả`}
            />
          </div>
        </div>
      </PageWrapper>

      {/* Slide-over panel — overlays on top, doesn't push content */}
      {selectedPayment && (
        <BookingDetailPanel 
          bookingCode={selectedPayment.bookingCode} 
          onClose={() => setSelectedPayment(null)} 
        />
      )}
    </div>
  );
}
