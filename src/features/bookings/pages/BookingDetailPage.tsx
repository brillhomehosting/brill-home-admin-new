import { Header, PageWrapper } from '@/shared/components/layout';
import { ROUTES } from '@/shared/constants';
import { cn, formatDate, formatCurrency } from '@/shared/utils';
import { Button } from '@/shared/components/ui/Button';
import {
    BedDouble,
    CalendarDays,
    CheckCircle,
    Clock,
    Copy,
    Lock,
    Mail,
    Pencil,
    PlusCircle,
    ReceiptText,
    RefreshCw,
    RotateCcw,
    Send,
    User,
    XCircle,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CancelBookingDialog } from '../components/CancelBookingDialog';
import { EditBookingDialog } from '../components/EditBookingDialog';
import { IDCardViewer } from '../components/IDCardViewer';
import { ManualPaymentDialog } from '../components/ManualPaymentDialog';
import { ResendEmailDialog } from '../components/ResendEmailDialog';
import { SurchargeDialog } from '../components/SurchargeDialog';
import { useBookingDetail } from '../hooks/useBookingDetail';

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isCancelOpen, setCancelOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [isEmailOpen, setEmailOpen] = useState(false);
  const [isSurchargeOpen, setSurchargeOpen] = useState(false);
  const [idViewerIndex, setIdViewerIndex] = useState<0 | 1 | null>(null);

  const { data: booking, isLoading, error } = useBookingDetail(bookingId);

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

  const statusConfig = statusMapping[booking.status] || {
    label: booking.status,
    classes: 'bg-secondary-100 text-secondary-700',
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title={
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold uppercase">{displayedCode}</span>
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', statusConfig.classes)}>
              <CheckCircle className="h-3.5 w-3.5" />
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
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="secondary"
              onClick={() => setEmailOpen(true)}
              icon={Mail}
              className="px-4"
            >
              Gửi lại email
            </Button>
            <Button 
              variant="secondary"
              onClick={() => setEditOpen(true)}
              icon={Pencil}
              className="px-4"
            >
              Sửa booking
            </Button>
            <Button 
              variant={booking.status === 'CANCELLED' ? 'secondary' : 'danger'}
              onClick={() => setCancelOpen(true)}
              disabled={booking.status === 'CANCELLED'}
              icon={booking.status === 'CANCELLED' ? CheckCircle : XCircle}
              className="px-4"
            >
              {booking.status === 'CANCELLED' ? 'Đã hủy booking' : 'Hủy booking'}
            </Button>
          </div>
        }
      />

      <PageWrapper className="flex-1 pb-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* --- Left Column --- */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Customer Info */}
            <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-secondary-700">
                  <User className="h-5 w-5 text-accent-500" />
                  Thông tin khách hàng
                </div>
                <button className="text-sm font-medium text-accent-500 transition-colors hover:text-accent-600">
                  Chỉnh sửa
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Họ và tên</p>
                  <p className="mt-1 text-base font-medium text-foreground">{booking.guestName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Số điện thoại</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-base font-medium text-foreground">{booking.guestPhone}</p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(booking.guestPhone)}
                      className="text-secondary-400 hover:text-primary-500" 
                      title="Sao chép"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Email</p>
                  <p className="mt-1 text-base font-medium text-foreground">{booking.guestEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Ghi chú</p>
                  <p className="mt-1 text-sm italic text-secondary-600">{booking.note || 'Không có ghi chú.'}</p>
                </div>
                {(booking.nationalIdFrontUrl || booking.nationalIdBackUrl) && (
                  <div className="sm:col-span-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">Giấy tờ tùy thân (CCCD)</p>
                    <div className="flex flex-wrap gap-4">
                      {booking.nationalIdFrontUrl && (
                        <button 
                          onClick={() => setIdViewerIndex(0)}
                          className="group relative h-24 w-36 overflow-hidden rounded-lg border border-border bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <img
                            src={booking.nationalIdFrontUrl}
                            alt="CCCD Front"
                            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                          />
                          <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">Mặt trước</div>
                        </button>
                      )}
                      {booking.nationalIdBackUrl && (
                        <button 
                          onClick={() => setIdViewerIndex(1)}
                          className="group relative h-24 w-36 overflow-hidden rounded-lg border border-border bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <img
                            src={booking.nationalIdBackUrl}
                            alt="CCCD Back"
                            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                          />
                          <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">Mặt sau</div>
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
              <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Loại phòng</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{booking.roomName}</p>
                    <p className="text-sm text-secondary-500">{formatDate(booking.date)}</p>
                  </div>
                  <div className="rounded-lg bg-primary-50 px-4 py-3 border border-primary-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary-700">Check-in</span>
                      <span className="font-bold text-foreground">{formatDate(booking.checkInAt, { hour: '2-digit', minute: '2-digit', hour12: false, month: undefined, day: undefined, year: undefined })}</span>
                    </div>
                    <div className="my-2 border-t border-primary-200 border-dashed" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary-700">Check-out</span>
                      <span className="font-bold text-foreground">
                        {formatDate(booking.checkOutAt, { hour: '2-digit', minute: '2-digit', hour12: false, month: undefined, day: undefined, year: undefined })}
                        {new Date(booking.checkOutAt).getDate() !== new Date(booking.checkInAt).getDate() && (
                          <span className="font-normal text-secondary-500 ml-1">(+1 ngày)</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Khung giờ đã đặt</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {booking.slots.map((slot) => (
                        <span key={slot.timeSlotId} className="rounded-md bg-secondary-100 px-3 py-1.5 text-sm font-medium text-secondary-700 border border-border">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Mật khẩu phòng</p>
                    <div className="mt-2 rounded-lg border border-border bg-surface-dim p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-secondary-500">Mã cổng chính (Gate Pass)</p>
                          <div className="mt-1 flex items-center gap-3">
                            <span className={cn('text-2xl font-bold tracking-widest text-foreground', !booking.gatePassword && 'text-secondary-400 italic text-lg')}>
                              {booking.gatePassword || 'Chưa được tạo'}
                            </span>
                            {booking.gatePassword && (
                              <button 
                                onClick={() => navigator.clipboard.writeText(booking.gatePassword!)}
                                className="text-accent-500 hover:text-accent-600" 
                                title="Sao chép"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {booking.passwordEffectiveAt && (
                            <p className="mt-1 text-[10px] text-secondary-500 leading-tight">
                              Hiệu lực từ: {formatDate(booking.passwordEffectiveAt, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
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
                <span className={cn('flex h-2 w-2 rounded-full relative', booking.tuyaSyncStatus === 'SUCCESS' ? 'bg-success-500' : 'bg-warning-500')}>
                  {booking.tuyaSyncStatus !== 'SUCCESS' && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning-400 opacity-75" />
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', booking.tuyaSyncStatus === 'SUCCESS' ? 'bg-success-50 text-success-500' : 'bg-warning-50 text-warning-500')}>
                    {booking.tuyaSyncStatus === 'SUCCESS' ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <RotateCcw className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {booking.tuyaSyncStatus === 'SUCCESS' ? 'Đã tạo mật khẩu thành công' : 'Đang chờ đồng bộ mật khẩu'}
                    </p>
                    <p className="text-xs text-secondary-400">Trạng thái: {booking.tuyaSyncStatus}</p>
                  </div>
                </div>
                <button 
                  disabled={booking.tuyaSyncStatus === 'PENDING'}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={cn('h-4 w-4', booking.tuyaSyncStatus === 'PENDING' && 'animate-spin')} />
                  Đồng bộ lại Tuya
                </button>
              </div>
            </div>
          </div>

          {/* --- Right Column --- */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {/* Payment Details */}
            <div className="rounded-xl border-t-4 border-t-accent-400 border border-border bg-surface shadow-sm overflow-hidden">
              <div className="flex items-center border-b border-border bg-surface-dim px-5 py-4 text-sm font-semibold text-secondary-700">
                <ReceiptText className="mr-2 h-5 w-5 text-accent-500" />
                Chi tiết thanh toán
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Giá gốc</span>
                  <span className="font-medium">{formatCurrency(booking.originalAmount)}</span>
                </div>
                {booking.holidaySurchargeAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Phụ phí lễ</span>
                    <span className="font-medium text-danger-500">+{formatCurrency(booking.holidaySurchargeAmount)}</span>
                  </div>
                )}
                {(booking.discountAmount > 0 || booking.comboDiscountAmount > 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Giảm giá</span>
                    <span className="font-medium text-success-600">-{formatCurrency(booking.discountAmount + booking.comboDiscountAmount)}</span>
                  </div>
                )}
                <div className="my-1 border-t border-border border-dashed" />
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-foreground">Tổng cộng</span>
                  <span className="text-2xl font-bold text-accent-500">{formatCurrency(booking.finalAmount)}</span>
                </div>
                {booking.payment ? (
                  <div className="mt-2 rounded-lg border border-border bg-secondary-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 shrink-0 items-center justify-center rounded bg-white px-2 py-1 shadow-sm border border-border">
                        <span className="text-[10px] font-bold text-primary-600 uppercase">{booking.payment.paymentMethod}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">
                          Trạng thái: <span className={booking.payment.paymentStatus === 'SUCCESS' ? 'text-success-600' : 'text-warning-600'}>
                            {booking.payment.paymentStatus}
                          </span>
                        </p>
                        <p className="text-[10px] text-secondary-500 truncate">Mã GD: {booking.payment.transactionNo || booking.payment.paymentCode}</p>
                      </div>
                    </div>
                    {booking.payment.paidAt && (
                      <div className="mt-2 text-right text-[10px] text-secondary-400">
                        {formatDate(booking.payment.paidAt, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 rounded-lg border border-dashed border-warning-300 bg-warning-50 p-4 text-center">
                    <p className="text-xs font-medium text-warning-700">Chưa có thông tin thanh toán</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
              <div className="flex px-5 py-4 text-sm font-semibold text-secondary-700 border-b border-border bg-surface-dim">
                Thao tác nhanh
              </div>
              <div className="flex flex-col p-2">
                <button 
                  onClick={() => setEmailOpen(true)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
                >
                  <Send className="h-4 w-4 text-secondary-400" />
                  Gửi lại xác nhận đặt phòng
                </button>
                <div className="mx-3 border-t border-border" />
                <button 
                  onClick={() => setPaymentOpen(true)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-success-600 transition-colors hover:bg-success-50"
                >
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  Xác nhận thanh toán thủ công
                </button>
                <div className="mx-3 border-t border-border" />
                <button 
                  onClick={() => setSurchargeOpen(true)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
                >
                  <PlusCircle className="h-4 w-4 text-secondary-400" />
                  Tạo phụ phí (Surcharge)
                </button>
                <div className="mx-3 border-t border-border" />
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50">
                  <CalendarDays className="h-4 w-4 text-secondary-400" />
                  Đổi lịch / Gia hạn
                </button>
                <div className="mx-3 border-t border-border" />
                <button 
                  onClick={() => setCancelOpen(true)}
                  disabled={booking.status === 'CANCELLED'}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    booking.status === 'CANCELLED'
                      ? "text-secondary-400"
                      : "text-danger-600 hover:bg-danger-50"
                  )}
                >
                  {booking.status === 'CANCELLED' ? (
                    <CheckCircle className="h-4 w-4 text-secondary-400" />
                  ) : (
                    <RotateCcw className="h-4 w-4 text-danger-400" />
                  )}
                  {booking.status === 'CANCELLED' ? 'Booking đã hủy' : 'Hoàn tiền / Hủy booking'}
                </button>
              </div>
            </div>

            {/* Activity History */}
            <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
              <div className="flex px-5 py-4 text-sm font-semibold text-secondary-700 border-b border-border bg-surface-dim">
                <Clock className="mr-2 h-5 w-5 text-accent-500" />
                Lịch sử hoạt động
              </div>
              <div className="p-5">
                <div className="relative border-l-2 border-border pl-6 space-y-8 ml-2">
                  
                  {/* Item 1 */}
                  <div className="relative">
                    <span className="absolute -left-[35px] top-1 h-4 w-4 rounded-full border-2 border-success-500 bg-surface ring-4 ring-surface" />
                    <p className="text-sm font-semibold text-foreground">Email đã được gửi</p>
                    <p className="text-xs text-secondary-400">Hôm nay, 14:32</p>
                    <p className="mt-1 text-sm text-secondary-600">Hệ thống đã gửi email xác nhận đặt phòng và mật khẩu của.</p>
                    <div className="mt-2 inline-flex items-center rounded bg-secondary-100 px-2 py-0.5 text-[10px] font-medium text-secondary-600">
                      System
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="relative">
                    <span className="absolute -left-[35px] top-1 h-4 w-4 rounded-full border-2 border-primary-500 bg-surface ring-4 ring-surface" />
                    <p className="text-sm font-semibold text-foreground">Tạo Room Pass thành công</p>
                    <p className="text-xs text-secondary-400">Hôm nay, 14:31</p>
                    <p className="mt-1 text-sm text-secondary-600">Tuya Smart Lock API trả về mã: 567890</p>
                    <div className="mt-2 inline-flex items-center rounded bg-secondary-100 px-2 py-0.5 text-[10px] font-medium text-secondary-600">
                      Tuya Service
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="relative">
                    <span className="absolute -left-[35px] top-1 h-4 w-4 rounded-full border-2 border-accent-400 bg-surface ring-4 ring-surface" />
                    <p className="text-sm font-semibold text-foreground">Thanh toán thành công</p>
                    <p className="text-xs text-secondary-400">Hôm nay, 14:30</p>
                    <p className="mt-1 text-sm text-secondary-600">Khách hàng thanh toán qua cổng VNPay.</p>
                    <div className="mt-2 inline-flex items-center rounded bg-secondary-100 px-2 py-0.5 text-[10px] font-medium text-secondary-600">
                      System
                    </div>
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
        bookingCode={displayedCode}
      />

      <ManualPaymentDialog
        open={isPaymentOpen}
        onClose={() => setPaymentOpen(false)}
        bookingId={booking.bookingId}
        bookingCode={displayedCode}
        roomName={booking.roomName}
        dateInfo={`${formatDate(booking.date)} (${booking.slots[0]?.startTime} - ${booking.slots[booking.slots.length - 1]?.endTime})`}
        customerName={booking.guestName}
        totalAmount={booking.finalAmount}
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

      <SurchargeDialog
        open={isSurchargeOpen}
        onClose={() => setSurchargeOpen(false)}
        bookingCode={displayedCode}
      />

      <IDCardViewer
        open={idViewerIndex !== null}
        onClose={() => setIdViewerIndex(null)}
        initialIndex={idViewerIndex ?? 0}
        customerName={booking.guestName}
        updatedAt={formatDate(booking.createdAt)}
        frontImage={booking.nationalIdFrontUrl}
        backImage={booking.nationalIdBackUrl}
      />
    </div>
  );
}
