import { useToast } from '@/shared/components/feedback/Toast';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { ROUTES } from '@/shared/constants';
import { cn, formatCurrency, formatDate } from '@/shared/utils';
import {
  AlertCircle,
  BedDouble,
  CheckCircle,
  ClipboardList,
  Clock,
  Copy,
  Loader2,
  Lock,
  Mail,
  Pencil,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Send,
  User,
  XCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IDCardViewer } from '../components/IDCardViewer';
import { CancelBookingDialog } from '../components/CancelBookingDialog';
import { EditBookingDialog } from '../components/EditBookingDialog';
import { ResendEmailDialog } from '../components/ResendEmailDialog';
import { useBookingDetail } from '../hooks/useBookingDetail';
import { useBookingMutation } from '../hooks/useBookingMutation';
import { useSystemConfig } from '../hooks/useSystemConfig';

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isCancelOpen, setCancelOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isEmailOpen, setEmailOpen] = useState(false);
  const [isIdViewerOpen, setIdViewerOpen] = useState(false);
  const [idViewerIndex, setIdViewerIndex] = useState<0 | 1>(0);
  const { toast } = useToast();

  const { data: booking, isLoading, error } = useBookingDetail(bookingId);
  const { 
    retryTuya,
    syncTuyaStatus
  } = useBookingMutation();

  const { data: bufferConfig } = useSystemConfig('GATE_PASSWORD_BUFFER_MINUTES');
  const bufferMinutes = parseInt(bufferConfig?.data?.configValue || '15', 10) || 15;

  // Auto-sync Tuya based on booking's tuyaSyncStatus
  useEffect(() => {
    if (!bookingId || !booking) return;

    const status = booking.tuyaSyncStatus;

    // CONFIRMED → auto call sync
    if (status === 'CONFIRMED') {
      syncTuyaStatus.mutate({ bookingId, tuyaSyncStatus: 'PENDING' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, booking?.tuyaSyncStatus]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
          <p className="text-sm font-medium text-secondary-500">Đang tải chi tiết booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex h-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
            <AlertCircle className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Không tìm thấy booking</h3>
            <p className="mt-1 text-sm text-secondary-500">
              Có lỗi xảy ra hoặc booking không tồn tại. Vui lòng thử lại sau.
            </p>
          </div>
          <button
            onClick={() => navigate('/apps/bookings')}
            className="rounded-lg bg-secondary-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary-800"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const displayedCode = `#BK-${booking.bookingCode}`;

  const statusMapping = {
    CANCELLED: { label: 'Đã hủy', classes: 'bg-danger-100 text-danger-700' },
    CONFIRMED: { label: 'Đã xác nhận', classes: 'bg-primary-100 text-primary-700' },
  };

  const statusConfig = statusMapping[booking.status] || {
    label: booking.status,
    classes: 'bg-secondary-100 text-secondary-700',
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title={
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl font-bold uppercase">{displayedCode}</span>
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold', statusConfig.classes)}>
              <CheckCircle className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              {statusConfig.label}
            </span>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Đặt phòng', path: '/apps/bookings' },
          { label: displayedCode },
        ]}
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => setEmailOpen(true)}
              icon={Mail}
              className="px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Gửi lại email</span>
            </Button>
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => setEditOpen(true)}
              icon={Pencil}
              className="px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Sửa</span>
            </Button>
            <Button 
              variant={booking.status === 'CANCELLED' ? 'secondary' : 'danger'}
              size="sm"
              onClick={() => setCancelOpen(true)}
              disabled={booking.status === 'CANCELLED'}
              icon={booking.status === 'CANCELLED' ? CheckCircle : XCircle}
              className="px-2 sm:px-4"
            >
              <span className="hidden sm:inline">{booking.status === 'CANCELLED' ? 'Đã hủy' : 'Hủy'}</span>
            </Button>
          </div>
        }
      />

      <PageWrapper className="flex-1 pb-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* --- Left Column --- */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Copyable Message */}
            {booking.copyMessage && (
              <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-secondary-700">
                    <ClipboardList className="h-5 w-5 text-accent-500" />
                    Thông tin gửi khách
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(booking.copyMessage!);
                      toast('Đã sao chép tin nhắn!', 'success');
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-accent-500 transition-colors hover:text-accent-600"
                  >
                    <Copy className="h-4 w-4" />
                    Sao chép
                  </button>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="rounded-lg bg-secondary-50 p-4 border border-border whitespace-pre-line text-sm text-secondary-700 font-mono leading-relaxed overflow-x-auto">
                    {booking.copyMessage}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Info */}
            <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-secondary-700">
                  <User className="h-5 w-5 text-accent-500" />
                  Khách hàng
                </div>
                <button className="text-sm font-medium text-accent-500 transition-colors hover:text-accent-600">
                  Chỉnh sửa
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 p-4 sm:p-5 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Họ và tên</p>
                  <p className="mt-0.5 text-base font-semibold text-foreground">{booking.guestName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Số điện thoại</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-base font-semibold text-foreground">{booking.guestPhone}</p>
                    <button onClick={() => navigator.clipboard.writeText(booking.guestPhone)} className="text-secondary-300 hover:text-primary-500 transition-colors">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Email</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{booking.guestEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Ghi chú</p>
                  <p className="mt-0.5 text-sm italic text-secondary-500">{booking.note || 'Không có ghi chú.'}</p>
                </div>

                {(booking.nationalIdFrontUrl || booking.nationalIdBackUrl) && (
                  <div className="sm:col-span-2 pt-4 border-t border-border">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Giấy tờ tùy thân (CCCD)</p>
                    <div className="flex flex-wrap gap-4">
                      {booking.nationalIdFrontUrl && (
                        <button 
                          onClick={() => {
                            setIdViewerIndex(0);
                            setIdViewerOpen(true);
                          }}
                          className="group relative h-24 w-36 overflow-hidden rounded-lg border border-border bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <img
                            src={booking.nationalIdFrontUrl}
                            alt="CCCD Front"
                            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                          />
                          <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white font-bold">Mặt trước</div>
                        </button>
                      )}
                      {booking.nationalIdBackUrl && (
                        <button 
                          onClick={() => {
                            setIdViewerIndex(1);
                            setIdViewerOpen(true);
                          }}
                          className="group relative h-24 w-36 overflow-hidden rounded-lg border border-border bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <img
                            src={booking.nationalIdBackUrl}
                            alt="CCCD Back"
                            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                          />
                          <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white font-bold">Mặt sau</div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Room & Time Info */}
            <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border bg-surface-dim px-5 py-4 text-sm font-semibold text-secondary-700">
                <BedDouble className="h-5 w-5 text-accent-500" />
                Thông tin phòng & Thời gian
              </div>
              <div className="grid grid-cols-1 gap-6 p-4 sm:p-5 sm:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Phòng đã đặt</p>
                    <p className="mt-0.5 text-lg font-bold text-foreground">{booking.roomName}</p>
                    <p className="text-xs text-secondary-500 font-medium">{formatDate(booking.date)}</p>
                  </div>
                  <div className="rounded-xl bg-primary-50/50 px-4 py-4 border border-primary-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary-700">Check-in</span>
                      <span className="font-bold text-foreground text-base">
                        {formatDate(booking.checkInAt, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false })}
                      </span>
                    </div>
                    <div className="my-3 border-t border-primary-200 border-dashed" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary-700">Check-out</span>
                      <span className="font-bold text-foreground text-base">
                        {formatDate(booking.checkOutAt, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false })}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400 mb-2">Khung giờ chi tiết</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.slots.map((slot) => (
                        <span key={slot.timeSlotId} className="rounded-lg bg-secondary-100 px-3 py-1.5 text-xs font-bold text-secondary-700 border border-border">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Mật khẩu truy cập</p>
                    <div className="mt-2 rounded-xl border border-border bg-surface-dim p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-tighter">Mã cổng chính (Gate Pass)</p>
                          <div className="mt-1 flex items-center gap-3">
                            <span className={cn('text-2xl font-bold tracking-[0.2em] text-foreground', !booking.gatePassword && 'text-secondary-300 italic text-lg tracking-normal')}>
                              {booking.gatePassword || 'Chưa được tạo'}
                            </span>
                            {booking.gatePassword && (
                              <button onClick={() => navigator.clipboard.writeText(booking.gatePassword!)} className="text-accent-500 hover:text-accent-600 transition-colors">
                                <Copy className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {booking.gatePassword && (
                            <p className="mt-2 text-[10px] text-secondary-400 leading-tight flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0" />
                              Hiệu lực: {formatDate(new Date(new Date(booking.checkInAt).getTime() - bufferMinutes * 60000).toISOString(), { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', hour12: false })} - {formatDate(new Date(new Date(booking.checkOutAt).getTime() - bufferMinutes * 60000).toISOString(), { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', hour12: false })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Lock */}
            <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-4 text-sm font-semibold text-secondary-700">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-accent-500" />
                  Tuya Smart Lock
                </div>
                <span className={cn('flex h-2.5 w-2.5 rounded-full relative', booking.tuyaSyncStatus === 'SUCCESS' ? 'bg-success-500' : 'bg-warning-500')}>
                  {booking.tuyaSyncStatus !== 'SUCCESS' && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning-400 opacity-75" />
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', booking.tuyaSyncStatus === 'SUCCESS' ? 'bg-success-50 text-success-500' : 'bg-warning-50 text-warning-500')}>
                    {booking.tuyaSyncStatus === 'SUCCESS' ? <CheckCircle className="h-6 w-6" /> : <RotateCcw className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm sm:text-base">
                      {booking.tuyaSyncStatus === 'SUCCESS' ? 'Đã đồng bộ thành công' : 'Đang xử lý đồng bộ'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-secondary-400 font-medium uppercase tracking-tighter">Status: {booking.tuyaSyncStatus}</p>
                      {booking.tuyaPasswordCreated && (
                        <span className="inline-flex items-center rounded-full bg-success-100 px-1.5 py-0.5 text-[9px] font-bold text-success-700 uppercase tracking-tighter">
                          API Created
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => retryTuya.mutate(bookingId!)}
                  disabled={booking.tuyaSyncStatus === 'PENDING' || retryTuya.isPending}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-secondary-700 transition-colors hover:bg-secondary-50 disabled:opacity-50"
                >
                  <RefreshCw className={cn('h-4 w-4', (booking.tuyaSyncStatus === 'PENDING' || retryTuya.isPending) && 'animate-spin')} />
                  Thử lại
                </button>
              </div>
            </div>
          </div>

          {/* --- Right Column --- */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {/* Payment Summary */}
            <div className="rounded-xl border-t-4 border-t-accent-400 border border-border bg-surface shadow-sm overflow-hidden">
              <div className="flex items-center border-b border-border bg-surface-dim px-5 py-4 text-sm font-semibold text-secondary-700">
                <ReceiptText className="mr-2 h-5 w-5 text-accent-500" />
                Chi tiết thanh toán
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-500 font-medium">Giá gốc</span>
                  <span className="font-semibold text-foreground">{formatCurrency(booking.originalAmount)}</span>
                </div>
                {booking.holidaySurchargeAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500 font-medium">Phụ phí lễ</span>
                    <span className="font-bold text-danger-500">+{formatCurrency(booking.holidaySurchargeAmount)}</span>
                  </div>
                )}
                {(booking.discountAmount > 0 || booking.comboDiscountAmount > 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500 font-medium">Giảm giá</span>
                    <span className="font-bold text-success-600">-{formatCurrency(booking.discountAmount + booking.comboDiscountAmount)}</span>
                  </div>
                )}
                <div className="my-1 border-t border-border border-dashed" />
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-foreground">Tổng cộng</span>
                  <span className="text-2xl font-bold text-accent-500 tracking-tight">{formatCurrency(booking.finalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
              <div className="flex px-5 py-4 text-sm font-semibold text-secondary-700 border-b border-border bg-surface-dim">
                Thao tác nhanh
              </div>
              <div className="flex flex-col p-2">
                <button onClick={() => setEmailOpen(true)} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-secondary-700 transition-colors hover:bg-secondary-50">
                  <Send className="h-4 w-4 text-secondary-400" />
                  Gửi lại xác nhận
                </button>
                <div className="mx-4 border-t border-border" />
                <button 
                  onClick={() => setCancelOpen(true)} 
                  disabled={booking.status === 'CANCELLED'}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition-colors disabled:opacity-50",
                    booking.status === 'CANCELLED' ? "text-secondary-400" : "text-danger-500 hover:bg-danger-50"
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                  {booking.status === 'CANCELLED' ? 'Booking đã hủy' : 'Hoàn tiền / Hủy booking'}
                </button>
              </div>
            </div>

            {/* Activity History */}
            <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
              <div className="flex px-5 py-4 text-sm font-semibold text-secondary-700 border-b border-border bg-surface-dim">
                <Clock className="mr-2 h-5 w-5 text-accent-500" />
                Lịch sử
              </div>
              <div className="p-5">
                <div className="relative border-l-2 border-border pl-6 space-y-8 ml-2">
                  <div className="relative">
                    <span className="absolute -left-[35px] top-1 h-4 w-4 rounded-full border-2 border-success-500 bg-surface ring-4 ring-surface" />
                    <p className="text-sm font-bold text-foreground">Email đã được gửi</p>
                    <p className="text-[10px] text-secondary-400 font-bold uppercase">Hôm nay, 14:32</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[35px] top-1 h-4 w-4 rounded-full border-2 border-primary-500 bg-surface ring-4 ring-surface" />
                    <p className="text-sm font-bold text-foreground">Tạo Room Pass thành công</p>
                    <p className="text-[10px] text-secondary-400 font-bold uppercase">Hôm nay, 14:31</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>

      <CancelBookingDialog
        open={isCancelOpen}
        onClose={() => setCancelOpen(false)}
        bookingId={booking.bookingId}
        bookingCode={displayedCode}
        roomName={booking.roomName}
        customerName={booking.guestName}
        checkInDate={formatDate(booking.checkInAt)}
        totalAmountStr={formatCurrency(booking.finalAmount)}
      />

      <EditBookingDialog
        open={isEditOpen}
        onClose={() => setEditOpen(false)}
        booking={booking}
      />

      <ResendEmailDialog
        open={isEmailOpen}
        onClose={() => setEmailOpen(false)}
        bookingId={booking.bookingId}
        bookingCode={displayedCode}
        roomName={booking.roomName}
        checkInDate={formatDate(booking.checkInAt)}
        customerName={booking.guestName}
        customerEmail={booking.guestEmail}
      />


      <IDCardViewer
        open={isIdViewerOpen}
        onClose={() => setIdViewerOpen(false)}
        customerName={booking.guestName}
        updatedAt={formatDate(booking.createdAt)}
        frontImage={booking.nationalIdFrontUrl}
        backImage={booking.nationalIdBackUrl}
        initialIndex={idViewerIndex}
      />
    </div>
  );
}
