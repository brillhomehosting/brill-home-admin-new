import { useToast } from '@/shared/components/feedback/Toast';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { Select } from '@/shared/components/ui/Select';
import { Textarea } from '@/shared/components/ui/Textarea';
import { ROUTES } from '@/shared/constants';
import { cn, formatCurrency, formatDate, getCredentialImageUrl } from '@/shared/utils';
import {
  AlertCircle,
  BedDouble,
  CheckCircle,
  ClipboardList,
  Clock,
  Copy,
  IdCard,
  Loader2,
  Lock,
  Mail,
  Pencil,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Send,
  Trash2,
  Upload,
  User,
  XCircle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { roomService } from '@/shared/services/room.service';
import { useNavigate, useParams } from 'react-router-dom';
import { IDCardViewer } from '../components/IDCardViewer';
import { CancelBookingDialog } from '../components/CancelBookingDialog';
import { ResendEmailDialog } from '../components/ResendEmailDialog';
import { useBookingDetail } from '../hooks/useBookingDetail';
import { useBookingMutation } from '../hooks/useBookingMutation';
import { useSystemConfig } from '../hooks/useSystemConfig';

const tuyaStatusOptions = [
  { value: 'PENDING', label: 'Chờ đồng bộ' },
  { value: 'SYNCED', label: 'Đã đồng bộ' },
  { value: 'FAILED', label: 'Đồng bộ lỗi' },
  { value: 'DELETE_PENDING', label: 'Chờ xoá mật khẩu' },
  { value: 'DELETED', label: 'Đã xoá mật khẩu' },
  { value: 'DELETE_FAILED', label: 'Xoá mật khẩu lỗi' },
];

type EditMode = 'customer' | 'gatePass' | 'tuya' | null;

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isCancelOpen, setCancelOpen] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isEmailOpen, setEmailOpen] = useState(false);
  const [isIdViewerOpen, setIdViewerOpen] = useState(false);
  const [idViewerIndex, setIdViewerIndex] = useState<0 | 1>(0);
  const [customerForm, setCustomerForm] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    note: '',
  });
  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string | null>(null);
  const [cccdBackPreview, setCccdBackPreview] = useState<string | null>(null);
  const [isUploadingCccd, setIsUploadingCccd] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [gatePassForm, setGatePassForm] = useState({
    gatePassword: '',
  });
  const [tuyaForm, setTuyaForm] = useState({
    tuyaSyncStatus: 'PENDING',
  });
  const { toast } = useToast();

  const { data: booking, isLoading, error } = useBookingDetail(bookingId);
  const { 
    updateBooking,
    retryTuya,
    syncTuyaStatus
  } = useBookingMutation();

  const { data: bufferConfig } = useSystemConfig('GATE_PASSWORD_BUFFER_MINUTES');
  const bufferMinutes = parseInt(bufferConfig?.data?.configValue || '15', 10) || 15;

  useEffect(() => {
    if (!booking || !editMode) return;
    setCustomerForm({
      guestName: booking.guestName || '',
      guestPhone: booking.guestPhone || '',
      guestEmail: booking.guestEmail || '',
      note: booking.note || '',
    });
    setCccdFrontFile(null);
    setCccdBackFile(null);
    setCccdFrontPreview(null);
    setCccdBackPreview(null);
    setGatePassForm({
      gatePassword: booking.gatePassword || '',
    });
    setTuyaForm({
      tuyaSyncStatus: booking.tuyaSyncStatus || 'PENDING',
    });
  }, [booking, editMode]);

  const handleCccdFileChange = (side: 'front' | 'back', file: File | null) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (side === 'front') {
      setCccdFrontFile(file);
      setCccdFrontPreview(preview);
    } else {
      setCccdBackFile(file);
      setCccdBackPreview(preview);
    }
  };

  const clearCccd = (side: 'front' | 'back') => {
    if (side === 'front') {
      setCccdFrontFile(null);
      setCccdFrontPreview(null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else {
      setCccdBackFile(null);
      setCccdBackPreview(null);
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  const handleCustomerFieldChange = (field: keyof typeof customerForm, value: string) => {
    setCustomerForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveCustomerInfo = async () => {
    if (!bookingId || !booking) return;

    let frontUrl: string | undefined;
    let backUrl: string | undefined;

    if (cccdFrontFile || cccdBackFile) {
      setIsUploadingCccd(true);
      try {
        if (cccdFrontFile) {
          const res = await roomService.uploadCredentials(cccdFrontFile);
          frontUrl = res.url;
        }
        if (cccdBackFile) {
          const res = await roomService.uploadCredentials(cccdBackFile);
          backUrl = res.url;
        }
      } catch {
        toast('Tải ảnh CCCD thất bại', 'error');
        setIsUploadingCccd(false);
        return;
      }
      setIsUploadingCccd(false);
    }

    await updateBooking.mutateAsync({
      bookingId,
      data: {
        guestName: customerForm.guestName,
        guestPhone: customerForm.guestPhone,
        guestEmail: customerForm.guestEmail,
        note: customerForm.note,
        ...(frontUrl !== undefined && { nationalIdFrontUrl: frontUrl }),
        ...(backUrl !== undefined && { nationalIdBackUrl: backUrl }),
      },
    });

    setEditMode(null);
  };

  const handleSaveGatePass = async () => {
    if (!bookingId || !booking) return;

    await updateBooking.mutateAsync({
      bookingId,
      data: {
        gatePassword: gatePassForm.gatePassword,
      },
    });

    setEditMode(null);
  };

  const handleSaveTuyaStatus = async () => {
    if (!bookingId || !booking) return;

    if (tuyaForm.tuyaSyncStatus !== booking.tuyaSyncStatus) {
      await syncTuyaStatus.mutateAsync({
        bookingId,
        tuyaSyncStatus: tuyaForm.tuyaSyncStatus,
      });
    }

    setEditMode(null);
  };

  const isSavingEdit = updateBooking.isPending || syncTuyaStatus.isPending || isUploadingCccd;

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

  const displayedCode = `#${booking.bookingCode}`;

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
              onClick={() => setEditMode('customer')}
              icon={Pencil}
              className="px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Sửa khách</span>
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

            {booking.status === 'CANCELLED' && (
              <div className="rounded-xl border border-danger-100 bg-danger-50/40 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 border-b border-danger-100 bg-danger-50 px-5 py-4 text-sm font-semibold text-danger-700">
                  <XCircle className="h-5 w-5" />
                  Thông tin hủy booking
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-danger-400">Lý do hủy</p>
                    <p className="mt-1 text-sm font-semibold text-danger-800">
                      {booking.cancellationReason || 'Chưa có lý do hủy.'}
                    </p>
                  </div>
                  {booking.cancellationNote && (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-danger-400">Ghi chú nội bộ</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-secondary-700">
                        {booking.cancellationNote}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-danger-400">Thời gian hủy</p>
                    <p className="mt-1 text-sm font-medium text-secondary-700">
                      {booking.cancelledAt ? formatDate(booking.cancelledAt, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false }) : 'Chưa có thông tin'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-danger-400">Nguồn hủy</p>
                    <p className="mt-1 text-sm font-medium text-secondary-700">
                      {booking.cancelledByType || 'Chưa có thông tin'}
                    </p>
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
                <button
                  onClick={() => setEditMode('customer')}
                  className="text-sm font-medium text-accent-500 transition-colors hover:text-accent-600"
                >
                  Chỉnh sửa
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 p-4 sm:p-5 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Họ và tên</p>
                  <p className="mt-0.5 text-base font-semibold text-foreground">{booking.guestName || 'Chưa có thông tin'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Số điện thoại</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-base font-semibold text-foreground">{booking.guestPhone || 'Chưa có thông tin'}</p>
                    {booking.guestPhone && (
                      <button onClick={() => navigator.clipboard.writeText(booking.guestPhone || '')} className="text-secondary-300 hover:text-primary-500 transition-colors">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Email</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{booking.guestEmail || 'Chưa có thông tin'}</p>
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
                            src={getCredentialImageUrl(booking.nationalIdFrontUrl)}
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
                            src={getCredentialImageUrl(booking.nationalIdBackUrl)}
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
              <div className="flex items-center justify-between border-b border-border bg-surface-dim px-5 py-4 text-sm font-semibold text-secondary-700">
                <div className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-accent-500" />
                  Thông tin phòng & Thời gian
                </div>
                <button
                  onClick={() => setEditMode('gatePass')}
                  className="text-sm font-medium text-accent-500 transition-colors hover:text-accent-600"
                >
                  Sửa mật khẩu
                </button>
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
                <span className={cn('flex h-2.5 w-2.5 rounded-full relative', booking.tuyaSyncStatus === 'SYNCED' ? 'bg-success-500' : 'bg-warning-500')}>
                  {booking.tuyaSyncStatus !== 'SYNCED' && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning-400 opacity-75" />
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', booking.tuyaSyncStatus === 'SYNCED' ? 'bg-success-50 text-success-500' : 'bg-warning-50 text-warning-500')}>
                    {booking.tuyaSyncStatus === 'SYNCED' ? <CheckCircle className="h-6 w-6" /> : <RotateCcw className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm sm:text-base">
                      {booking.tuyaSyncStatus === 'SYNCED' ? 'Đã đồng bộ thành công' : 'Đang xử lý đồng bộ'}
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
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => setEditMode('tuya')}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-secondary-700 transition-colors hover:bg-secondary-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Sửa trạng thái
                  </button>
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
        customerName={booking.guestName || ''}
        checkInDate={formatDate(booking.checkInAt)}
        totalAmountStr={formatCurrency(booking.finalAmount)}
      />

      <Modal
        open={editMode === 'customer'}
        onClose={() => setEditMode(null)}
        title="Cập nhật khách hàng"
        description="Chỉnh sửa thông tin hiển thị trong mục Khách hàng."
        size="xl"
        closeOnOverlayClick={!isSavingEdit}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditMode(null)}
              disabled={isSavingEdit}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSaveCustomerInfo}
              loading={updateBooking.isPending}
            >
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Họ và tên"
              value={customerForm.guestName}
              onChange={(event) => handleCustomerFieldChange('guestName', event.target.value)}
              placeholder="Tên khách hàng"
              disabled={isSavingEdit}
            />
            <Input
              label="Số điện thoại"
              value={customerForm.guestPhone}
              onChange={(event) => handleCustomerFieldChange('guestPhone', event.target.value)}
              placeholder="Số điện thoại"
              disabled={isSavingEdit}
            />
            <Input
              label="Email"
              type="email"
              value={customerForm.guestEmail}
              onChange={(event) => handleCustomerFieldChange('guestEmail', event.target.value)}
              placeholder="email@example.com"
              disabled={isSavingEdit}
            />
          </div>

          <Textarea
            label="Ghi chú"
            value={customerForm.note}
            onChange={(event) => handleCustomerFieldChange('note', event.target.value)}
            placeholder="Ghi chú nội bộ cho booking"
            rows={4}
            disabled={isSavingEdit}
          />

          {/* CCCD Upload */}
          <div className="rounded-xl border border-border bg-secondary-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-secondary-700">
              <IdCard className="h-4 w-4 text-accent-500" />
              CCCD / Giấy tờ tùy thân
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Front */}
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary-400">Mặt trước</p>
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isSavingEdit}
                  onChange={(e) => handleCccdFileChange('front', e.target.files?.[0] ?? null)}
                />
                {cccdFrontPreview ? (
                  <div className="relative">
                    <img src={cccdFrontPreview} alt="CCCD Front" className="h-28 w-full rounded-lg object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => clearCccd('front')}
                      disabled={isSavingEdit}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : booking?.nationalIdFrontUrl ? (
                  <div className="relative group cursor-pointer" onClick={() => frontInputRef.current?.click()}>
                    <img src={getCredentialImageUrl(booking.nationalIdFrontUrl)} alt="CCCD Front" className="h-28 w-full rounded-lg object-cover border border-border opacity-80 group-hover:opacity-60 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white">Thay ảnh</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => frontInputRef.current?.click()}
                    disabled={isSavingEdit}
                    className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-secondary-200 bg-white text-secondary-400 transition-colors hover:border-accent-300 hover:text-accent-400"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-xs font-medium">Tải lên</span>
                  </button>
                )}
              </div>

              {/* Back */}
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary-400">Mặt sau</p>
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isSavingEdit}
                  onChange={(e) => handleCccdFileChange('back', e.target.files?.[0] ?? null)}
                />
                {cccdBackPreview ? (
                  <div className="relative">
                    <img src={cccdBackPreview} alt="CCCD Back" className="h-28 w-full rounded-lg object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => clearCccd('back')}
                      disabled={isSavingEdit}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : booking?.nationalIdBackUrl ? (
                  <div className="relative group cursor-pointer" onClick={() => backInputRef.current?.click()}>
                    <img src={getCredentialImageUrl(booking.nationalIdBackUrl)} alt="CCCD Back" className="h-28 w-full rounded-lg object-cover border border-border opacity-80 group-hover:opacity-60 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white">Thay ảnh</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => backInputRef.current?.click()}
                    disabled={isSavingEdit}
                    className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-secondary-200 bg-white text-secondary-400 transition-colors hover:border-accent-300 hover:text-accent-400"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-xs font-medium">Tải lên</span>
                  </button>
                )}
              </div>
            </div>
            {isUploadingCccd && (
              <div className="mt-3 flex items-center gap-2 text-xs text-accent-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang tải ảnh CCCD lên...
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={editMode === 'gatePass'}
        onClose={() => setEditMode(null)}
        title="Cập nhật mật khẩu phòng"
        description="Chỉ chỉnh sửa mã cổng chính trong mục Thông tin phòng & Thời gian."
        size="md"
        closeOnOverlayClick={!isSavingEdit}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditMode(null)}
              disabled={isSavingEdit}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSaveGatePass}
              loading={updateBooking.isPending}
            >
              Lưu mật khẩu
            </Button>
          </>
        }
      >
        <Input
          label="Mật khẩu phòng"
          value={gatePassForm.gatePassword}
          onChange={(event) => setGatePassForm({ gatePassword: event.target.value.replace(/\D/g, '').slice(0, 20) })}
          placeholder="Ví dụ: 123456"
          hint="Chỉ nhập số, 4 đến 20 chữ số. Để trống nếu booking chưa có mật khẩu."
          inputMode="numeric"
          disabled={isSavingEdit}
        />
      </Modal>

      <Modal
        open={editMode === 'tuya'}
        onClose={() => setEditMode(null)}
        title="Cập nhật Tuya Smart Lock"
        description="Chỉ chỉnh sửa trạng thái đồng bộ Tuya của booking."
        size="md"
        closeOnOverlayClick={!isSavingEdit}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditMode(null)}
              disabled={isSavingEdit}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSaveTuyaStatus}
              loading={syncTuyaStatus.isPending}
            >
              Lưu trạng thái
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-border bg-surface-dim p-4">
          <Select
            label="Trạng thái Tuya Smart Lock"
            value={tuyaForm.tuyaSyncStatus}
            onChange={(event) => setTuyaForm({ tuyaSyncStatus: event.target.value })}
            options={tuyaStatusOptions}
            disabled={isSavingEdit}
            hint="Chọn trạng thái thực tế sau khi kiểm tra đồng bộ mật khẩu cửa."
          />
        </div>
      </Modal>

      <ResendEmailDialog
        open={isEmailOpen}
        onClose={() => setEmailOpen(false)}
        bookingId={booking.bookingId}
        bookingCode={displayedCode}
        roomName={booking.roomName}
        checkInDate={formatDate(booking.checkInAt)}
        customerName={booking.guestName || ''}
        customerEmail={booking.guestEmail || ''}
      />


      <IDCardViewer
        open={isIdViewerOpen}
        onClose={() => setIdViewerOpen(false)}
        customerName={booking.guestName || ''}
        updatedAt={formatDate(booking.createdAt)}
        frontImage={getCredentialImageUrl(booking.nationalIdFrontUrl)}
        backImage={getCredentialImageUrl(booking.nationalIdBackUrl)}
        initialIndex={idViewerIndex}
      />
    </div>
  );
}
