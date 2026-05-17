import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useMultiDayAvailability } from '@/features/rooms/hooks/useTimeSlotBooking';
import { useToast } from '@/shared/components/feedback/Toast';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { DateInput } from '@/shared/components/ui/DateInput';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Textarea } from '@/shared/components/ui/Textarea';
import { ROUTES } from '@/shared/constants';
import { cn, formatCurrency } from '@/shared/utils';
import { 
  Calendar, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Clock,
  Camera,
  X
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingMutation } from '../hooks/useBookingMutation';
import { useCalculatePrice } from '../hooks/useBookings';
import { roomService } from '@/shared/services/room.service';
import type { PaymentMethod } from '@/shared/types';

export default function CreateBookingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string[]>>({});

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [note, setNote] = useState('');
  const [nationalIdFrontFile, setNationalIdFrontFile] = useState<File | null>(null);
  const [nationalIdBackFile, setNationalIdBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [transactionNo, setTransactionNo] = useState('');
  const [paymentNote] = useState('');
  const [sendEmail, setSendEmail] = useState(false);

  // Queries
  const { data: roomsResponse, isLoading: isLoadingRooms } = useRooms({ limit: 100 });
  const rooms = roomsResponse?.data?.content || [];
  const dayQueries = useMultiDayAvailability(selectedRoomId, viewDate, 7);
  const isLoadingSlots = dayQueries.some(q => q.isLoading);
  const { adminCreateBooking } = useBookingMutation();

  const allAvailableSlots = useMemo(() => {
    return dayQueries.flatMap((q, idx) => {
      const d = new Date(viewDate);
      d.setDate(d.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];
      return (q.data || []).map(s => ({ ...s, date: dateStr }));
    });
  }, [dayQueries, viewDate]);

  const bookingSlotsPayload = useMemo(() => {
    return Object.entries(selectedSlots)
      .filter(([_, ids]) => ids.length > 0)
      .map(([date, timeSlotIds]) => ({ date, timeSlotIds }));
  }, [selectedSlots]);

  const { data: priceData, isLoading: isCalculating } = useCalculatePrice({
    roomId: selectedRoomId,
    bookingSlots: bookingSlotsPayload
  });

  const handleSlotToggle = (date: string, slotId: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    const currentDaySlots = selectedSlots[date] || [];
    const isSelected = currentDaySlots.includes(slotId);
    const flatSelection = Object.entries(selectedSlots)
      .flatMap(([d, ids]) => ids.map(id => ({ date: d, slotId: id })))
      .map(sel => {
        const slotInfo = allAvailableSlots.find(s => s.date === sel.date && s.timeSlot.id === sel.slotId);
        return { ...sel, startTime: slotInfo?.timeSlot.startTime || '' };
      })
      .filter(s => !!s.startTime)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });

    if (isSelected) {
      if (flatSelection.length <= 1) {
        setSelectedSlots(prev => ({ ...prev, [date]: [] }));
        return;
      }
      const first = flatSelection[0];
      const last = flatSelection[flatSelection.length - 1];
      if ((date === first.date && slotId === first.slotId) || (date === last.date && slotId === last.slotId)) {
        setSelectedSlots(prev => ({
          ...prev,
          [date]: (prev[date] || []).filter(id => id !== slotId)
        }));
        return;
      }
      toast('Chỉ có thể bỏ chọn từ hai đầu', 'warning');
    } else {
      if (flatSelection.length === 0) {
        setSelectedSlots(prev => ({ ...prev, [date]: [slotId] }));
        return;
      }
      const allSlotsSorted = [...allAvailableSlots].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
      });
      const clickedIdx = allSlotsSorted.findIndex(s => s.date === date && s.timeSlot.id === slotId);
      const first = flatSelection[0];
      const last = flatSelection[flatSelection.length - 1];
      const firstIdx = allSlotsSorted.findIndex(s => s.date === first.date && s.timeSlot.id === first.slotId);
      const lastIdx = allSlotsSorted.findIndex(s => s.date === last.date && s.timeSlot.id === last.slotId);
      if (clickedIdx === firstIdx - 1 || clickedIdx === lastIdx + 1) {
        setSelectedSlots(prev => ({ ...prev, [date]: [...(prev[date] || []), slotId] }));
        return;
      }
      toast('Vui lòng chọn khung giờ liền kề', 'warning');
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

  const handleCreateBooking = async () => {
    if (!selectedRoomId || bookingSlotsPayload.length === 0) {
      toast('Vui lòng chọn phòng và giờ', 'warning');
      return;
    }
    try {
      setIsCreating(true);
      setIsUploading(true);

      let frontUrl = '';
      let backUrl = '';

      if (nationalIdFrontFile) {
        const res = await roomService.uploadCredentials(nationalIdFrontFile);
        frontUrl = res.url;
      }
      if (nationalIdBackFile) {
        const res = await roomService.uploadCredentials(nationalIdBackFile);
        backUrl = res.url;
      }

      setIsUploading(false);

      adminCreateBooking.mutate({
        roomId: selectedRoomId,
        slots: bookingSlotsPayload,
        guestName: customerName.trim() || undefined,
        guestEmail: customerEmail.trim() || undefined,
        guestPhone: customerPhone.trim() || undefined,
        nationalIdFrontUrl: frontUrl || undefined,
        nationalIdBackUrl: backUrl || undefined,
        note: note.trim() || undefined,
        paymentMethod,
        transactionNo: transactionNo || undefined,
        paymentNote: paymentNote || undefined,
        sendConfirmationEmail: sendEmail && Boolean(customerEmail.trim()),
      }, {
        onSuccess: (res) => {
          if (res?.data?.bookingId) navigate(ROUTES.BOOKINGS.DETAIL(res.data.bookingId));
          else navigate(ROUTES.BOOKINGS.LIST);
        },
        onSettled: () => setIsCreating(false)
      });
    } catch (error) {
      setIsCreating(false);
    }
  };

  const pricing = priceData || {
    totalBasePrice: 0,
    totalHolidaySurcharge: 0,
    totalDiscountAmount: 0,
    totalComboDiscount: 0,
    totalPrice: 0,
    breakdown: []
  };

  return (
    <div className="flex h-full flex-col bg-secondary-50/20">
      <Header
        title="Tạo Booking"
        breadcrumbs={[
          { label: 'Booking', path: ROUTES.BOOKINGS.LIST },
          { label: 'Tạo mới' },
        ]}
      />

      <PageWrapper className="flex-1 pb-10">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 gap-4 lg:grid-cols-12">
          
          {/* CỘT TRÁI */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* STEP 1: PHÒNG & NGÀY */}
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Chọn phòng
                  </label>
                  <Select
                    className="h-10 text-sm font-semibold rounded-lg border-secondary-200"
                    value={selectedRoomId}
                    onChange={(e) => {
                      setSelectedRoomId(e.target.value);
                      setSelectedSlots({});
                    }}
                    options={[
                      { value: '', label: 'Chọn phòng...' },
                      ...rooms.map((r) => ({ value: r.id, label: r.name })),
                    ]}
                    loading={isLoadingRooms}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Ngày bắt đầu
                  </label>
                  <DateInput
                    value={selectedDate}
                    onChange={(value) => {
                      setSelectedDate(value);
                      setViewDate(value);
                      setSelectedSlots({});
                    }}
                    className="rounded-lg border-secondary-200 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: 7 NGÀY */}
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="h-6 w-6 rounded-lg bg-accent-500 text-white flex items-center justify-center">
                      <Clock className="h-3.5 w-3.5" />
                   </div>
                   <h2 className="text-sm font-semibold text-foreground">Lịch trình 7 ngày</h2>
                </div>
                <div className="flex items-center gap-1 bg-secondary-50 p-1 rounded-lg border border-secondary-100">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md" onClick={handlePrevDays}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-[9px] font-bold text-secondary-500 uppercase">{new Date(viewDate).toLocaleDateString('vi-VN')}</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md" onClick={handleNextDays}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {!selectedRoomId ? (
                <div className="py-10 text-center border-2 border-dashed border-secondary-100 rounded-xl bg-secondary-50/20">
                  <p className="text-xs font-bold text-secondary-400">Vui lòng chọn phòng ở bước trên</p>
                </div>
              ) : isLoadingSlots ? (
                <div className="py-12 flex flex-col items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                  <p className="text-[10px] font-bold text-secondary-400 mt-2">Đang tải...</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide snap-x">
                    {dayQueries.map((query, idx) => {
                      const d = new Date(viewDate);
                      d.setDate(d.getDate() + idx);
                      const isToday = d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                      const dateStr = d.toISOString().split('T')[0];
                      const daySlots = query.data || [];
                      const selectedForDay = selectedSlots[dateStr] || [];

                      return (
                        <div key={dateStr} className="flex-none w-[130px] snap-start">
                          <div className={cn(
                            "mb-3 p-2 rounded-lg border-2 text-center",
                            isToday ? "bg-primary-50 border-primary-100" : "bg-white border-transparent"
                          )}>
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-secondary-400">
                              {d.toLocaleDateString('vi-VN', { weekday: 'short' })}
                            </p>
                            <p className="text-sm font-bold text-foreground">
                              {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            {daySlots.length === 0 ? (
                              <div className="py-6 text-center rounded-lg bg-secondary-50/50 border border-secondary-100">
                                 <p className="text-[9px] font-bold text-secondary-300">N/A</p>
                              </div>
                            ) : (
                              daySlots.map((slot) => {
                                const isSelected = selectedForDay.includes(slot.timeSlot.id);
                                const isAvailable = slot.status === 'AVAILABLE';

                                return (
                                  <button
                                    key={slot.timeSlot.id}
                                    type="button"
                                    disabled={!isAvailable}
                                    onClick={() => handleSlotToggle(dateStr, slot.timeSlot.id, isAvailable)}
                                    className={cn(
                                      'group relative flex flex-col items-center justify-center rounded-lg border-2 py-2 px-1 transition-all',
                                      !isAvailable
                                        ? 'cursor-not-allowed border-secondary-50 bg-secondary-50/30'
                                        : isSelected
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-secondary-100 bg-white hover:border-primary-200'
                                    )}
                                  >
                                    <span className={cn(
                                      'text-[11px] font-semibold',
                                      isSelected ? 'text-primary-700' : isAvailable ? 'text-secondary-700' : 'text-secondary-300'
                                    )}>
                                      {slot.timeSlot.startTime.split(':').slice(0,2).join(':')} - {slot.timeSlot.endTime.split(':').slice(0,2).join(':')}
                                    </span>
                                    {isSelected && (
                                      <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-md bg-primary-500 text-white shadow-md ring-2 ring-white">
                                        <Check className="h-2.5 w-2.5 stroke-[4]" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: KHÁCH HÀNG */}
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Tên khách (tuỳ chọn)</label>
                  <Input 
                    placeholder="VD: Nguyễn Văn A" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 text-sm font-semibold rounded-lg border-secondary-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">SĐT (tuỳ chọn)</label>
                  <Input 
                    placeholder="0987..." 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-9 text-sm font-semibold rounded-lg border-secondary-200"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Email (tuỳ chọn)</label>
                  <Input 
                    placeholder="example@mail.com" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="h-9 text-sm font-semibold rounded-lg border-secondary-200"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Ghi chú</label>
                  <Textarea
                    placeholder="Ghi chú cho admin..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="min-h-[72px] text-sm font-medium rounded-lg border-secondary-200"
                  />
                </div>
                
                <div className="sm:col-span-2 grid grid-cols-2 gap-3 pt-4 border-t border-secondary-100">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase text-secondary-400 flex items-center gap-1.5">
                       <Camera className="h-3.5 w-3.5" /> CCCD Mặt trước
                    </label>
                    <div className="relative border-2 border-dashed border-secondary-200 rounded-xl p-3 flex flex-col items-center justify-center min-h-[100px] bg-secondary-50/30 hover:bg-white hover:border-primary-400 transition-all">
                      {frontPreview ? (
                         <div className="relative group w-full h-full flex items-center justify-center">
                           <img src={frontPreview} alt="F" className="max-h-[80px] w-auto object-contain rounded shadow-sm" />
                           <button onClick={() => removeFile('front')} className="absolute -top-2 -right-2 bg-danger-500 text-white rounded-lg p-1.5 shadow-md hover:bg-danger-600 transition-colors">
                             <X className="w-3.5 h-3.5 stroke-[3]" />
                           </button>
                         </div>
                      ) : (
                        <div className="text-center">
                          <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, 'front')} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <Camera className="h-5 w-5 text-secondary-300 mx-auto mb-1" />
                          <span className="text-[10px] font-bold text-secondary-400 uppercase">Chọn mặt trước</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase text-secondary-400 flex items-center gap-1.5">
                       <Camera className="h-3.5 w-3.5" /> CCCD Mặt sau
                    </label>
                    <div className="relative border-2 border-dashed border-secondary-200 rounded-xl p-3 flex flex-col items-center justify-center min-h-[100px] bg-secondary-50/30 hover:bg-white hover:border-primary-400 transition-all">
                      {backPreview ? (
                         <div className="relative group w-full h-full flex items-center justify-center">
                           <img src={backPreview} alt="B" className="max-h-[80px] w-auto object-contain rounded shadow-sm" />
                           <button onClick={() => removeFile('back')} className="absolute -top-2 -right-2 bg-danger-500 text-white rounded-lg p-1.5 shadow-md hover:bg-danger-600 transition-colors">
                             <X className="w-3.5 h-3.5 stroke-[3]" />
                           </button>
                         </div>
                      ) : (
                        <div className="text-center">
                          <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, 'back')} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <Camera className="h-5 w-5 text-secondary-300 mx-auto mb-1" />
                          <span className="text-[10px] font-bold text-secondary-400 uppercase">Chọn mặt sau</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4: THANH TOÁN */}
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Phương thức</label>
                  <Select
                    className="h-9 text-xs font-semibold rounded-lg border-secondary-200"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    options={[
                      { value: 'CASH', label: 'Tiền mặt' },
                      { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
                      { value: 'OTHER', label: 'Khác' },
                    ]}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">Mã GD</label>
                  <Input 
                    placeholder="Mã..." 
                    value={transactionNo}
                    onChange={(e) => setTransactionNo(e.target.value)}
                    className="h-9 text-sm font-semibold rounded-lg border-secondary-200"
                  />
                </div>
                <div className="sm:col-span-2 pt-1">
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="h-3.5 w-3.5 rounded border-secondary-300 text-primary-500" />
                      <span className="text-[11px] font-bold text-secondary-500">Gửi Email xác nhận cho khách</span>
                   </label>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: SUMMARY */}
          <div className="lg:col-span-4">
            <div className="sticky top-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 pb-2 border-b border-secondary-100">Xác nhận</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-secondary-500">
                  <span>Tiền thuê</span>
                  <span className="font-bold text-foreground">{formatCurrency(pricing.totalBasePrice)}</span>
                </div>
                
                {pricing.totalHolidaySurcharge > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary-500">Ngày lễ</span>
                    <span className="font-bold text-danger-500">+{formatCurrency(pricing.totalHolidaySurcharge)}</span>
                  </div>
                )}

                {(pricing.totalDiscountAmount > 0 || pricing.totalComboDiscount > 0) && (
                  <div className="space-y-1 p-2 rounded-lg bg-success-50 border border-success-100">
                    {pricing.totalDiscountAmount > 0 && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-success-700">Giảm ưu đãi</span>
                        <span className="font-bold text-success-700">-{formatCurrency(pricing.totalDiscountAmount)}</span>
                      </div>
                    )}
                    {pricing.totalComboDiscount > 0 && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-success-700">Giảm Combo</span>
                        <span className="font-bold text-success-700">-{formatCurrency(pricing.totalComboDiscount)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-secondary-100 border-dashed">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-secondary-400 uppercase">Tổng cộng</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {isCalculating ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(pricing.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  className="w-full h-11 text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary-500/10"
                  onClick={handleCreateBooking}
                  loading={isCreating || adminCreateBooking.isPending || isUploading}
                  disabled={bookingSlotsPayload.length === 0}
                >
                  Tạo Booking
                </Button>
                <p className="mt-3 text-center text-[9px] text-secondary-400 font-bold italic leading-tight">
                   Booking sẽ được ghi nhận với trạng thái ĐÃ XÁC NHẬN.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
