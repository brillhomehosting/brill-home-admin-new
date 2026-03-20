import { Header, PageWrapper } from '@/shared/components/layout';
import { ROUTES } from '@/shared/constants';
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
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CancelBookingDialog } from '../components/CancelBookingDialog';
import { EditBookingDialog } from '../components/EditBookingDialog';
import { IDCardViewer } from '../components/IDCardViewer';
import { ManualPaymentDialog } from '../components/ManualPaymentDialog';
import { ResendEmailDialog } from '../components/ResendEmailDialog';
import { SurchargeDialog } from '../components/SurchargeDialog';

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const displayedCode = bookingId ? `#BK-${bookingId}` : '#BK-A1F3C2';
  const [isCancelOpen, setCancelOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [isEmailOpen, setEmailOpen] = useState(false);
  const [isSurchargeOpen, setSurchargeOpen] = useState(false);
  const [idViewerIndex, setIdViewerIndex] = useState<0 | 1 | null>(null);

  return (
    <div className="flex h-full flex-col">
      <Header
        title={
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold uppercase">{displayedCode}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-700">
              <CheckCircle className="h-3.5 w-3.5" />
              Đã thanh toán
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
            <button 
              onClick={() => setEmailOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              <Mail className="h-4 w-4" />
              Gửi lại email
            </button>
            <button 
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              <Pencil className="h-4 w-4" />
              Sửa booking
            </button>
            <button 
              onClick={() => setCancelOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 px-4 py-2 text-sm font-medium text-danger-600 transition-colors hover:bg-danger-100"
            >
              <XCircle className="h-4 w-4" />
              Hủy booking
            </button>
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
                  <p className="mt-1 text-base font-medium text-foreground">Nguyễn Thị Mai</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Số điện thoại</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-base font-medium text-foreground">0987 654 321</p>
                    <button className="text-secondary-400 hover:text-primary-500" title="Sao chép">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Email</p>
                  <p className="mt-1 text-base font-medium text-foreground">mai.nguyen@example.com</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Ghi chú</p>
                  <p className="mt-1 text-sm italic text-secondary-600">Khách yêu cầu thêm gối, check-in trễ.</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">Giấy tờ tùy thân (CCCD)</p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setIdViewerIndex(0)}
                      className="group relative h-24 w-36 overflow-hidden rounded-lg border border-border bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=200"
                        alt="CCCD Front"
                        className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                      />
                      <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">Mặt trước</div>
                    </button>
                    <button 
                      onClick={() => setIdViewerIndex(1)}
                      className="group relative h-24 w-36 overflow-hidden rounded-lg border border-border bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1617260848074-cefc66946ce2?auto=format&fit=crop&q=80&w=300&h=200"
                        alt="CCCD Back"
                        className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                      />
                      <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">Mặt sau</div>
                    </button>
                  </div>
                </div>
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
                    <p className="mt-1 text-lg font-bold text-foreground">Cinema Room (VIP)</p>
                    <p className="text-sm text-secondary-500">Tầng 3, Phòng 302</p>
                  </div>
                  <div className="rounded-lg bg-primary-50 px-4 py-3 border border-primary-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary-700">Check-in</span>
                      <span className="font-bold text-foreground">18:00</span>
                    </div>
                    <div className="my-2 border-t border-primary-200 border-dashed" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary-700">Check-out</span>
                      <span className="font-bold text-foreground">08:00 <span className="font-normal text-secondary-500">(+1 ngày)</span></span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Khung giờ</p>
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-md bg-secondary-100 px-3 py-1.5 text-sm font-medium text-secondary-700 border border-border">18:00 - 22:00</span>
                      <span className="rounded-md bg-secondary-100 px-3 py-1.5 text-sm font-medium text-secondary-700 border border-border">22:00 - 08:00</span>
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
                            <span className="text-2xl font-bold tracking-widest text-foreground">123456</span>
                            <button className="text-accent-500 hover:text-accent-600" title="Sao chép">
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
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
                <span className="flex h-2 w-2 rounded-full bg-success-500 relative">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
                </span>
              </div>
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success-500">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Đã tạo mật khẩu thành công</p>
                    <p className="text-xs text-secondary-400">Device ID: bf45...8a92</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50">
                  <RefreshCw className="h-4 w-4" />
                  Tạo lại mật khẩu Tuya
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
                  <span className="font-medium">650.000đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Giảm giá (KM)</span>
                  <span className="font-medium text-success-600">-103.750đ</span>
                </div>
                <div className="my-1 border-t border-border border-dashed" />
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-foreground">Tổng cộng</span>
                  <span className="text-2xl font-bold text-accent-500">546.250đ</span>
                </div>
                <div className="mt-2 rounded-lg border border-border bg-secondary-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 shrink-0 items-center justify-center rounded bg-white px-2 py-1 shadow-sm border border-border">
                      <span className="text-[10px] font-bold text-primary-600">VNPAY</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Thanh toán qua VNPay</p>
                      <p className="text-[10px] text-secondary-500">Mã GD: 9823743623</p>
                    </div>
                  </div>
                  <div className="mt-2 text-right text-[10px] text-secondary-400">
                    20/10/2023 - 14:30:22
                  </div>
                </div>
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
                  className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-danger-600 transition-colors hover:bg-danger-50"
                >
                  <RotateCcw className="h-4 w-4 text-danger-400" />
                  Hoàn tiền / Hủy booking
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
        bookingCode={displayedCode}
        roomName="Cinema Room 02"
        customerName="Nguyễn Thị Mai"
        checkInDate="01/03/2026"
        totalAmountStr="546.250đ"
      />

      <EditBookingDialog
        open={isEditOpen}
        onClose={() => setEditOpen(false)}
        bookingCode={displayedCode}
      />

      <ManualPaymentDialog
        open={isPaymentOpen}
        onClose={() => setPaymentOpen(false)}
        bookingCode={displayedCode}
      />

      <ResendEmailDialog
        open={isEmailOpen}
        onClose={() => setEmailOpen(false)}
        bookingCode={displayedCode}
        roomName="Phòng Cinema"
        checkInDate="01/03/2026"
        customerName="Nguyễn Thị Mai"
        customerEmail="mai.nguyen@gmail.com"
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
        customerName="Nguyễn Thị Mai"
        updatedAt="12/10/2023"
        frontImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200"
        backImage="https://images.unsplash.com/photo-1617260848074-cefc66946ce2?auto=format&fit=crop&q=80&w=1200"
      />
    </div>
  );
}
