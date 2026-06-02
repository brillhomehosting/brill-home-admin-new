import { useState, useEffect } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { DateInput, Pagination, Select } from '@/shared/components/ui';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
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
  Pencil,
  Hash,
  Clock,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';
import { usePayments } from '../hooks/usePayments';
import { usePaymentMutation } from '../hooks/usePaymentMutation';
import { useBookingByCode } from '@/features/bookings/hooks/useBookings';
import type { Payment, PaymentMethod, PaymentStatus } from '@/shared/types';

// --- Payment Detail Slide-over Panel ---

const PAYMENT_METHOD_OPTIONS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'BANK_TRANSFER_VP', label: 'Chuyển khoản VPBank' },
  { value: 'BANK_TRANSFER_TECH', label: 'Chuyển khoản TechcomBank' },
  { value: 'OTHER', label: 'Khác' },
];

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER_VP: 'Chuyển khoản VPBank',
  BANK_TRANSFER_TECH: 'Chuyển khoản TechcomBank',
  OTHER: 'Khác',
};

function PaymentDetailPanel({ payment, onClose, onUpdated }: { payment: Payment; onClose: () => void; onUpdated: (p: Payment) => void }) {
  const { data: booking, isLoading: bookingLoading } = useBookingByCode(payment.bookingCode);
  const { updatePayment } = usePaymentMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editMethod, setEditMethod] = useState<PaymentMethod>(payment.paymentMethod);
  const [editTxNo, setEditTxNo] = useState(payment.transactionNo || '');

  useEffect(() => {
    setEditMethod(payment.paymentMethod);
    setEditTxNo(payment.transactionNo || '');
    setIsEditing(false);
  }, [payment.paymentCode]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSave = async () => {
    const updated = await updatePayment.mutateAsync({
      paymentId: payment.paymentId,
      data: { paymentMethod: editMethod, transactionNo: editTxNo || undefined },
    });
    onUpdated({ ...payment, paymentMethod: updated.paymentMethod, transactionNo: updated.transactionNo });
    setIsEditing(false);
  };

  const pmStatus = payment.paymentStatus === 'PAID'
    ? { label: 'Đã thanh toán', classes: 'bg-success-100 text-success-700', Icon: CheckCircle2 }
    : { label: 'Đã hoàn tiền', classes: 'bg-warning-100 text-warning-700', Icon: RotateCcw };

  return (
    <>
      <div className="fixed inset-0 z-overlay bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-modal w-full max-w-sm flex flex-col bg-surface shadow-xl border-l border-border animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-accent-500" />
            <h3 className="text-sm font-bold text-foreground">Chi tiết thanh toán</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-secondary-400 hover:bg-secondary-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Payment info block */}
          <div className="p-5 space-y-4">
            {/* Amount + status */}
            <div className="rounded-xl border border-border bg-accent-50/40 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400 mb-1">Số tiền</p>
                <p className="text-2xl font-black text-accent-600 tracking-tight">{formatCurrency(payment.amount)}</p>
              </div>
              <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', pmStatus.classes)}>
                <pmStatus.Icon className="h-3.5 w-3.5" />
                {pmStatus.label}
              </span>
            </div>

            {/* Payment method + transactionNo */}
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-dim">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary-500">Thông tin thanh toán</span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Phương thức</label>
                    <Select
                      value={editMethod}
                      onChange={(e) => setEditMethod(e.target.value as PaymentMethod)}
                      options={PAYMENT_METHOD_OPTIONS}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Mã giao dịch</label>
                    <Input
                      value={editTxNo}
                      onChange={(e) => setEditTxNo(e.target.value)}
                      placeholder="Nhập mã giao dịch..."
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="primary" disabled={updatePayment.isPending} onClick={handleSave} className="flex-1">
                      {updatePayment.isPending ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)} className="flex-1 border-secondary-300 shadow-sm">
                      Huỷ
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-xs text-secondary-500">
                      <Banknote className="h-3.5 w-3.5" />
                      Phương thức
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {PAYMENT_METHOD_LABEL[payment.paymentMethod] || payment.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-start justify-between px-4 py-3 gap-4">
                    <span className="flex items-center gap-2 text-xs text-secondary-500 shrink-0">
                      <Hash className="h-3.5 w-3.5" />
                      Mã GD
                    </span>
                    <span className="text-xs font-mono font-semibold text-foreground text-right break-all">
                      {payment.transactionNo || <span className="text-secondary-400 italic font-sans font-normal">Chưa có</span>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-xs text-secondary-500">
                      <Receipt className="h-3.5 w-3.5" />
                      Mã thanh toán
                    </span>
                    <span className="text-xs font-mono text-secondary-600">{payment.paymentCode}</span>
                  </div>
                  {payment.paidAt && (
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="flex items-center gap-2 text-xs text-secondary-500">
                        <Clock className="h-3.5 w-3.5" />
                        Ngày thanh toán
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {formatDate(payment.paidAt, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Booking info */}
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-surface-dim">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary-500">Thông tin booking</span>
              </div>
              {bookingLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                </div>
              ) : !booking ? (
                <div className="px-4 py-4 text-xs text-secondary-400 text-center">Không tải được thông tin booking</div>
              ) : (
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-xs text-secondary-500">
                      <User className="h-3.5 w-3.5" />
                      Khách
                    </span>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground">{booking.guestName || '—'}</p>
                      {booking.guestPhone && <p className="text-[10px] text-secondary-400">{booking.guestPhone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-xs text-secondary-500">
                      <MapPin className="h-3.5 w-3.5" />
                      Phòng
                    </span>
                    <span className="text-xs font-semibold text-foreground">{booking.roomName}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-secondary-500">Ngày</span>
                    <span className="text-xs font-medium text-foreground">{formatDate(booking.date)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-surface-dim">
          <Link
            to={`/apps/bookings/${booking?.bookingId ?? ''}`}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-surface py-2.5 text-xs font-medium text-accent-500 border border-accent-200 hover:bg-accent-50 transition-colors"
          >
            Xem chi tiết booking
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
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
  BANK_TRANSFER_VP: 'Chuyển khoản VPBank',
  BANK_TRANSFER_TECH: 'Chuyển khoản TechcomBank',
  OTHER: 'Khác',
};

export default function PaymentListPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(undefined);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
    startDate: startDate || undefined,
    endDate: endDate || undefined,
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
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5 bg-surface/50">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Mã giao dịch, mã booking..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-base sm:text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
                />
              </div>
              <span className="text-[11px] font-bold text-secondary-400 uppercase tracking-wider whitespace-nowrap">
                Tổng số: {totalElements}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Trạng thái</label>
                <Select
                  value={status || ''}
                  onChange={(e) => {
                    setStatus((e.target.value as PaymentStatus) || undefined);
                    setPage(0);
                  }}
                  options={[
                    { value: '', label: 'Tất cả' },
                    { value: 'PAID', label: 'Đã thanh toán' },
                    { value: 'REFUNDED', label: 'Đã hoàn tiền' },
                  ]}
                  className="h-9 text-xs sm:text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Phương thức</label>
                <Select
                  value={paymentMethod || ''}
                  onChange={(e) => {
                    setPaymentMethod((e.target.value as PaymentMethod) || undefined);
                    setPage(0);
                  }}
                  options={[
                    { value: '', label: 'Tất cả' },
                    { value: 'CASH', label: 'Tiền mặt' },
                    { value: 'BANK_TRANSFER_VP', label: 'Chuyển khoản VPBank' },
                    { value: 'BANK_TRANSFER_TECH', label: 'Chuyển khoản TechcomBank' },
                    { value: 'OTHER', label: 'Khác' },
                  ]}
                  className="h-9 text-xs sm:text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Từ ngày</label>
                <DateInput
                  value={startDate}
                  onChange={(value) => { setStartDate(value); setPage(0); }}
                  className="h-9 rounded-lg text-xs sm:text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Đến ngày</label>
                <DateInput
                  value={endDate}
                  onChange={(value) => { setEndDate(value); setPage(0); }}
                  className="h-9 rounded-lg text-xs sm:text-sm"
                />
              </div>
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
        <PaymentDetailPanel
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onUpdated={(updated) => setSelectedPayment(updated)}
        />
      )}
    </div>
  );
}
