import { useState, useMemo, useEffect } from 'react';
import {
  ArrowDown,
  Pencil,
  TriangleAlert,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  Camera,
  X,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';
import { DateInput } from '@/shared/components/ui/DateInput';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { cn, formatCurrency, getCredentialImageUrl } from '@/shared/utils';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useMultiDayAvailability } from '@/features/rooms/hooks/useTimeSlotBooking';
import { useCalculatePrice } from '@/features/bookings/hooks/useBookings';
import { roomService } from '@/shared/services/room.service';
import { useBookingMutation } from '@/features/bookings/hooks/useBookingMutation';
import { useToast } from '@/shared/components/feedback/Toast';

type EditBookingDialogProps = {
  open: boolean;
  onClose: () => void;
  booking: any;
};

export function EditBookingDialog({
  open,
  onClose,
  booking,
}: EditBookingDialogProps) {
  const { toast } = useToast();
  const { data: roomsResponse, isLoading: isLoadingRooms } = useRooms({ limit: 100 });
  const rooms = roomsResponse?.data?.content || [];
  const { updateBooking } = useBookingMutation();

  // Basic Info
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string[]>>({});
  
  // Customer Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [note, setNote] = useState('');
  
  // CCCD Files
  const [nationalIdFrontFile, setNationalIdFrontFile] = useState<File | null>(null);
  const [nationalIdBackFile, setNationalIdBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Payment Info
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [transactionNo, setTransactionNo] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  // Initialize with current booking data
  useEffect(() => {
    if (open && booking) {
      setSelectedRoomId(booking.roomId || '');
      const checkIn = new Date(booking.checkInAt);
      setViewDate(checkIn.toISOString().split('T')[0]);
      
      setCustomerName(booking.guestName || '');
      setCustomerPhone(booking.guestPhone || '');
      setCustomerEmail(booking.guestEmail || '');
      setNote(booking.note || '');
      
      setPaymentMethod(booking.paymentMethod || 'CASH');
      setTransactionNo(booking.payment?.transactionNo || '');
      
      setFrontPreview(getCredentialImageUrl(booking.nationalIdFrontUrl) || '');
      setBackPreview(getCredentialImageUrl(booking.nationalIdBackUrl) || '');

      // Pre-select current slots
      const initialSlots: Record<string, string[]> = {};
      if (booking.slots) {
        booking.slots.forEach((s: any) => {
          const d = s.date;
          if (!initialSlots[d]) initialSlots[d] = [];
          initialSlots[d].push(s.timeSlotId);
        });
      }
      setSelectedSlots(initialSlots);
    }
  }, [open, booking]);

  const dayQueries = useMultiDayAvailability(selectedRoomId, viewDate, 7);
  const isLoadingSlots = dayQueries.some(q => q.isLoading);

  const roomOptions = useMemo(() => [
    { value: '', label: 'Chọn phòng...' },
    ...rooms.map((r: any) => ({ value: r.id, label: r.name }))
  ], [rooms]);

  const toggleSlot = (date: string, slotId: string) => {
    setSelectedSlots(prev => {
      const current = prev[date] || [];
      if (current.includes(slotId)) {
        const next = current.filter(id => id !== slotId);
        if (next.length === 0) {
          const { [date]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [date]: next };
      }
      return { ...prev, [date]: [...current, slotId] };
    });
  };

  const bookingSlotsPayload = useMemo(() => 
    Object.entries(selectedSlots)
      .filter(([_, ids]) => ids.length > 0)
      .map(([date, timeSlotIds]) => ({ date, timeSlotIds })),
  [selectedSlots]);

  const { data: priceData, isLoading: isCalculating } = useCalculatePrice({
    roomId: selectedRoomId,
    bookingSlots: bookingSlotsPayload
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (type === 'front') {
      setNationalIdFrontFile(file);
      setFrontPreview(previewUrl);
    } else {
      setNationalIdBackFile(file);
      setBackPreview(previewUrl);
    }
    if (e.target) e.target.value = '';
  };

  const removeFile = (type: 'front' | 'back') => {
    if (type === 'front') {
      setNationalIdFrontFile(null);
      setFrontPreview('');
    } else {
      setNationalIdBackFile(null);
      setBackPreview('');
    }
  };

  const handleUpdate = async () => {
    if (!selectedRoomId || bookingSlotsPayload.length === 0) {
      toast('Vui lòng chọn phòng và lịch trình', 'warning');
      return;
    }
    try {
      setIsUploading(true);
      
      let frontUrl = frontPreview;
      let backUrl = backPreview;

      if (nationalIdFrontFile) {
        const res = await roomService.uploadCredentials(nationalIdFrontFile);
        frontUrl = res.url;
      }
      if (nationalIdBackFile) {
        const res = await roomService.uploadCredentials(nationalIdBackFile);
        backUrl = res.url;
      }

      setIsUploading(false);

      await updateBooking.mutateAsync({
        bookingId: booking.bookingId,
        data: {
          roomId: selectedRoomId,
          slots: bookingSlotsPayload,
          guestName: customerName,
          guestEmail: customerEmail,
          guestPhone: customerPhone,
          nationalIdFrontUrl: frontUrl || undefined,
          nationalIdBackUrl: backUrl || undefined,
          note: note,
          paymentMethod: paymentMethod as any,
          transactionNo: transactionNo || undefined,
          sendConfirmationEmail: sendEmail,
        }
      });
      onClose();
    } catch (err) {
      setIsUploading(false);
    }
  };

  const handleNextDays = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 7);
    setViewDate(d.toISOString().split('T')[0]);
  };

  const handlePrevDays = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 7);
    setViewDate(d.toISOString().split('T')[0]);
  };

  const totalPrice = priceData?.totalPrice || 0;
  const priceDiff = totalPrice - (booking?.finalAmount || 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-50 text-accent-500">
            <Pencil className="h-4 w-4" />
          </div>
          Sửa booking {booking?.bookingCode}
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
             <input
                type="checkbox"
                id="send-email-edit"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent-500"
              />
              <label htmlFor="send-email-edit" className="text-xs font-medium text-secondary-600 cursor-pointer">
                Gửi email xác nhận mới
              </label>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} className="border-secondary-200">
              Hủy
            </Button>
            <Button
              className="bg-accent-500 text-white hover:bg-accent-600"
              onClick={handleUpdate}
              loading={updateBooking.isPending || isUploading}
              disabled={bookingSlotsPayload.length === 0}
            >
              Xác nhận thay đổi
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
        <div className="flex items-start gap-3 rounded-xl bg-warning-50 px-4 py-3 text-[13px] text-warning-800 border border-warning-100">
          <TriangleAlert className="h-5 w-5 mt-0.5 shrink-0 text-warning-500" />
          <div>
            <p className="font-bold mb-0.5 uppercase tracking-wide text-xs">Cảnh báo thay đổi</p>
            <p className="text-warning-700 leading-relaxed text-xs">
              Lưu ý: Thông tin cũ sẽ bị thay thế hoàn toàn ngay sau khi xác nhận.
            </p>
          </div>
        </div>

        {/* STEP 1: ROOM & SCHEDULE */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary-500 text-white flex items-center justify-center text-[10px] font-bold">1</div>
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Phòng & Lịch trình</h3>
           </div>
           
           <div className="rounded-xl border border-border bg-surface p-4 shadow-sm space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Chọn phòng</label>
                  <Select
                    className="h-9 text-sm font-medium rounded-lg !text-secondary-950"
                    value={selectedRoomId}
                    onChange={(e) => {
                        setSelectedRoomId(e.target.value);
                        setSelectedSlots({});
                    }}
                    options={roomOptions}
                    loading={isLoadingRooms}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Ngày bắt đầu</label>
                  <DateInput
                    value={viewDate}
                    onChange={setViewDate}
                    className="h-9 rounded-lg border-secondary-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Lịch trình 7 ngày</h4>
                <div className="flex items-center gap-1 bg-secondary-50 p-1 rounded-lg border border-secondary-100">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handlePrevDays}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleNextDays}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border border-secondary-100 bg-secondary-50/30">
                <div className="flex overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {!selectedRoomId ? (
                    <div className="flex h-[100px] w-full items-center justify-center flex-col gap-2">
                       <Clock className="h-6 w-6 text-secondary-200" />
                       <p className="text-[10px] font-bold text-secondary-400 uppercase">Vui lòng chọn phòng</p>
                    </div>
                  ) : isLoadingSlots ? (
                    <div className="flex h-[150px] w-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-accent-400" />
                    </div>
                  ) : (
                    dayQueries.map((q, idx) => {
                      const d = new Date(viewDate);
                      d.setDate(d.getDate() + idx);
                      const dateStr = d.toISOString().split('T')[0];
                      const daySlots = q.data || [];
                      
                      return (
                        <div key={dateStr} className="min-w-[130px] flex-1 border-r border-secondary-100 last:border-0 p-2.5 snap-start">
                          <div className="mb-2 p-1.5 rounded-lg bg-white border border-secondary-100 text-center shadow-sm">
                            <p className="text-[8px] font-bold uppercase text-secondary-400">{d.toLocaleDateString('vi-VN', { weekday: 'short' })}</p>
                            <p className="text-xs font-bold text-foreground">{d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</p>
                          </div>
                          <div className="space-y-1.5">
                            {daySlots.map((slot: any) => {
                              const isSelected = selectedSlots[dateStr]?.includes(slot.timeSlot.id);
                              const isAvailable = slot.status === 'AVAILABLE' || slot.status === 'VACANT';
                              return (
                                <button
                                  key={slot.timeSlot.id}
                                  type="button"
                                  disabled={!isAvailable && !isSelected}
                                  onClick={() => toggleSlot(dateStr, slot.timeSlot.id)}
                                  className={cn(
                                    "w-full p-2 rounded-lg border text-left transition-all relative group",
                                    isSelected 
                                      ? "bg-accent-50 border-accent-300 shadow-sm ring-1 ring-accent-300" 
                                      : isAvailable 
                                        ? "bg-white border-secondary-100 hover:border-accent-200" 
                                        : "bg-secondary-50 border-transparent opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={cn("text-[10px] font-bold", isSelected ? "text-accent-700" : "text-secondary-600")}>
                                      {slot.timeSlot.startTime.split(':').slice(0,2).join(':')}
                                    </span>
                                    {isSelected && <Check className="h-2.5 w-2.5 text-accent-600" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
           </div>
        </div>

        {/* STEP 2: CUSTOMER */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary-500 text-white flex items-center justify-center text-[10px] font-bold">2</div>
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Khách hàng</h3>
           </div>
           
           <div className="rounded-xl border border-border bg-surface p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Tên khách</label>
                <Input 
                  placeholder="Nguyễn Văn A" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-9 text-sm font-medium rounded-lg !text-secondary-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">SĐT</label>
                <Input 
                  placeholder="0987..." 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-9 text-sm font-medium rounded-lg !text-secondary-950"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Email</label>
                <Input 
                  placeholder="example@mail.com" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-9 text-sm font-medium rounded-lg !text-secondary-950"
                />
              </div>
              <div className="sm:col-span-2 grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase text-secondary-400 flex items-center gap-1.5">
                       <Camera className="h-3.5 w-3.5" /> CCCD Trước
                    </label>
                    <div className="relative border-2 border-dashed border-secondary-200 rounded-xl p-3 flex flex-col items-center justify-center min-h-[80px] bg-secondary-50/30">
                      {frontPreview ? (
                         <div className="relative group w-full h-full flex items-center justify-center">
                           <img src={frontPreview} alt="F" className="max-h-[60px] w-auto object-contain rounded shadow-sm" />
                           <button type="button" onClick={() => removeFile('front')} className="absolute -top-2 -right-2 bg-danger-500 text-white rounded-lg p-1 shadow-md"><X className="w-3 h-3" /></button>
                         </div>
                      ) : (
                        <div className="text-center">
                          <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, 'front')} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <Camera className="h-4 w-4 text-secondary-300 mx-auto" />
                          <span className="text-[9px] font-bold text-secondary-400 uppercase">Chọn ảnh</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase text-secondary-400 flex items-center gap-1.5">
                       <Camera className="h-3.5 w-3.5" /> CCCD Sau
                    </label>
                    <div className="relative border-2 border-dashed border-secondary-200 rounded-xl p-3 flex flex-col items-center justify-center min-h-[80px] bg-secondary-50/30">
                      {backPreview ? (
                         <div className="relative group w-full h-full flex items-center justify-center">
                           <img src={backPreview} alt="B" className="max-h-[60px] w-auto object-contain rounded shadow-sm" />
                           <button type="button" onClick={() => removeFile('back')} className="absolute -top-2 -right-2 bg-danger-500 text-white rounded-lg p-1 shadow-md"><X className="w-3 h-3" /></button>
                         </div>
                      ) : (
                        <div className="text-center">
                          <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, 'back')} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <Camera className="h-4 w-4 text-secondary-300 mx-auto" />
                          <span className="text-[9px] font-bold text-secondary-400 uppercase">Chọn ảnh</span>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
           </div>
        </div>

        {/* STEP 3: PAYMENT & NOTE */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary-500 text-white flex items-center justify-center text-[10px] font-bold">3</div>
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Thanh toán & Ghi chú</h3>
           </div>
           
           <div className="rounded-xl border border-border bg-surface p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Phương thức</label>
                <Select
                  className="h-9 text-xs font-medium rounded-lg !text-secondary-950"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  options={[
                    { value: 'CASH', label: 'Tiền mặt' },
                    { value: 'BANK_TRANSFER_VP', label: 'Chuyển khoản VPBank' },
                    { value: 'BANK_TRANSFER_TECH', label: 'Chuyển khoản TechcomBank' },
                    { value: 'OTHER', label: 'Khác' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Mã GD</label>
                <Input 
                  placeholder="Mã..." 
                  value={transactionNo}
                  onChange={(e) => setTransactionNo(e.target.value)}
                  className="h-9 text-sm font-medium rounded-lg !text-secondary-950"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                 <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Ghi chú</label>
                 <Textarea 
                    placeholder="Ghi chú cho admin..." 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[60px] text-xs font-medium rounded-lg !text-secondary-950"
                 />
              </div>
           </div>
        </div>

        {/* SUMMARY */}
        <div className="rounded-xl bg-primary-50 px-5 py-4 border border-primary-100">
           <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                 <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">Giá cũ</p>
                 <p className="text-xs font-bold text-secondary-500">{formatCurrency(booking?.finalAmount || 0)}</p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                 <ArrowDown className="h-3.5 w-3.5 rotate-[270deg]" />
              </div>
              <div className="space-y-0.5 text-center">
                 <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">Giá mới</p>
                 <p className="text-sm font-bold text-foreground">
                    {isCalculating ? <Loader2 className="h-3.5 w-3.5 animate-spin inline" /> : formatCurrency(totalPrice)}
                 </p>
              </div>
              <div className="h-6 w-px bg-primary-200 mx-2" />
              <div className="space-y-0.5 text-right">
                 <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">Chênh lệch</p>
                 <p className={cn("text-xs font-bold", priceDiff > 0 ? "text-danger-500" : priceDiff < 0 ? "text-success-600" : "text-secondary-400")}>
                    {priceDiff > 0 ? '+' : ''}{formatCurrency(priceDiff)}
                 </p>
              </div>
           </div>
        </div>
      </div>
    </Modal>
  );
}
