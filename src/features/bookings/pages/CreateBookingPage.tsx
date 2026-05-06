import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useMultiDayAvailability } from '@/features/rooms/hooks/useTimeSlotBooking';
import { useToast } from '@/shared/components/feedback/Toast';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Textarea } from '@/shared/components/ui/Textarea';
import { ROUTES } from '@/shared/constants';
import { cn, formatCurrency } from '@/shared/utils';
import { Check, ChevronRight, Loader2, Calendar, ChevronLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingMutation } from '../hooks/useBookingMutation';
import { useCalculatePrice } from '../hooks/useBookings';

export default function CreateBookingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Section 1 State
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]); // Current view window start
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string[]>>({}); // date -> slotIds[]

  // Section 2 State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [note, setNote] = useState('');

  // Section 3 State
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [transactionNo, setTransactionNo] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  // Queries & Mutations
  const { data: roomsResponse, isLoading: isLoadingRooms } = useRooms({ limit: 100 });
  const rooms = roomsResponse?.data?.content || [];

  const dayQueries = useMultiDayAvailability(selectedRoomId, viewDate, 3);
  const isLoadingSlots = dayQueries.some(q => q.isLoading);

  const { adminCreateBooking } = useBookingMutation();

  // Flatten all available slots with their date across all loaded days
  const allAvailableSlots = useMemo(() => {
    return dayQueries.flatMap((q, idx) => {
      const d = new Date(viewDate);
      d.setDate(d.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];
      return (q.data || []).map(s => ({ ...s, date: dateStr }));
    });
  }, [dayQueries, viewDate]);

  // Pricing Hook
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

    // Get all currently selected slots across all days, sorted by time
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
      // Deselecting: only allowed if it's the first or last in the sequence
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
      
      toast('Chỉ có thể bỏ chọn từ hai đầu của khoảng thời gian đã chọn', 'warning');
    } else {
      // Selecting: only allowed if adjacent to current selection
      if (flatSelection.length === 0) {
        setSelectedSlots(prev => ({ ...prev, [date]: [slotId] }));
        return;
      }

      // Find the index of the clicked slot in the full list of slots (all days)
      const allSlotsSorted = [...allAvailableSlots].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
      });
      
      const clickedIdx = allSlotsSorted.findIndex(s => s.date === date && s.timeSlot.id === slotId);
      
      // Check if adjacent to first or last
      const first = flatSelection[0];
      const last = flatSelection[flatSelection.length - 1];
      
      const firstIdx = allSlotsSorted.findIndex(s => s.date === first.date && s.timeSlot.id === first.slotId);
      const lastIdx = allSlotsSorted.findIndex(s => s.date === last.date && s.timeSlot.id === last.slotId);
      
      if (clickedIdx === firstIdx - 1 || clickedIdx === lastIdx + 1) {
        setSelectedSlots(prev => ({
          ...prev,
          [date]: [...(prev[date] || []), slotId]
        }));
        return;
      }

      toast('Vui lòng chọn khung giờ liền kề với các khung giờ đã chọn', 'warning');
    }
  };

  const handleNextDays = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 3);
    setViewDate(d.toISOString().split('T')[0]);
  };

  const handlePrevDays = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 3);
    setViewDate(d.toISOString().split('T')[0]);
  };



  const handleCreateBooking = async () => {
    if (!selectedRoomId || bookingSlotsPayload.length === 0) {
      toast('Vui lòng chọn đầy đủ phòng và khung giờ', 'warning');
      return;
    }

    if (!customerEmail || !customerName || !customerPhone) {
      toast('Vui lòng nhập đầy đủ thông tin khách hàng', 'warning');
      return;
    }

    try {
      setIsCreating(true);

      adminCreateBooking.mutate({
        roomId: selectedRoomId,
        slots: bookingSlotsPayload,
        guestName: customerName,
        guestEmail: customerEmail,
        guestPhone: customerPhone,
        note: note || 'Booking được tạo bởi Admin',
        paymentMethod: paymentMethod as any, // Cast as any if union types mismatch string state
        transactionNo: transactionNo || undefined,
        paymentNote: paymentNote || undefined,
        sendConfirmationEmail: sendEmail,
      }, {
        onSuccess: (res) => {
          if (res?.data?.bookingId) {
            navigate(ROUTES.BOOKINGS.DETAIL(res.data.bookingId));
          } else {
            navigate(ROUTES.BOOKINGS.LIST);
          }
        },
        onSettled: () => {
          setIsCreating(false);
        }
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
    <div className="flex h-full flex-col">
      <Header
        title="Tạo booking thủ công"
        breadcrumbs={[
          { label: 'Booking', path: ROUTES.BOOKINGS.LIST },
          { label: 'Tạo mới' },
        ]}
      />

      <PageWrapper className="flex-1 pb-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cột trái: Chọn phòng & thời gian */}
          <div className="lg:col-span-2 space-y-8">
            {/* Phần 1: Chọn phòng & Ngày bắt đầu */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-600 font-bold border border-accent-100">
                  1
                </div>
                <h2 className="text-lg font-bold text-foreground">Chọn phòng & Ngày bắt đầu</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Chọn phòng
                  </label>
                  <Select
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

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Ngày bắt đầu xem
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setViewDate(e.target.value);
                        setSelectedSlots({});
                      }}
                      className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3 text-sm font-medium outline-none transition-all focus:border-accent-400 focus:ring-2 focus:ring-accent-400/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Phần 2: Chọn khung giờ (Multi-day) */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-600 font-bold border border-accent-100">
                    2
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Chọn khung giờ liền kề</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={handlePrevDays}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-xs font-medium text-secondary-500 bg-secondary-50 px-3 py-1 rounded-full">
                     Đang xem {new Date(viewDate).toLocaleDateString('vi-VN')}
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={handleNextDays}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {!selectedRoomId ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-secondary-400 border-2 border-dashed border-border rounded-xl bg-secondary-50/30">
                  <div className="mb-3 rounded-full bg-white p-3 shadow-sm">
                     <Calendar className="h-6 w-6 text-secondary-300" />
                  </div>
                  <p className="text-sm font-medium">Vui lòng chọn phòng để xem khung giờ trống</p>
                </div>
              ) : isLoadingSlots ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dayQueries.map((query, idx) => {
                    const d = new Date(viewDate);
                    d.setDate(d.getDate() + idx);
                    const dateStr = d.toISOString().split('T')[0];
                    const daySlots = query.data || [];
                    const selectedForDay = selectedSlots[dateStr] || [];

                    return (
                      <div key={dateStr} className="space-y-4">
                        <div className="pb-2 border-b border-border">
                           <p className="text-sm font-bold text-foreground">
                              {d.toLocaleDateString('vi-VN', { weekday: 'long' })}
                           </p>
                           <p className="text-xs text-secondary-400">{d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                          {daySlots.length === 0 ? (
                            <p className="py-8 text-center text-xs text-secondary-400 italic">Không có khung giờ</p>
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
                                    'group relative flex flex-col items-center justify-center rounded-xl border p-3 transition-all',
                                    !isAvailable
                                      ? 'cursor-not-allowed border-border bg-secondary-50/50 opacity-50'
                                      : isSelected
                                      ? 'border-accent-400 bg-accent-50/50 shadow-[0_0_0_1px_var(--color-accent-400)]'
                                      : 'border-border bg-surface hover:border-secondary-300 hover:bg-secondary-50/30'
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      'text-sm font-bold',
                                      isSelected ? 'text-accent-700' : 'text-foreground'
                                    )}>
                                      {slot.timeSlot.startTime} - {slot.timeSlot.endTime}
                                    </span>
                                  </div>
                                  <span className={cn(
                                    'mt-1 text-[10px] font-bold uppercase tracking-wider',
                                    !isAvailable ? 'text-danger-500' : isSelected ? 'text-accent-500' : 'text-success-500'
                                  )}>
                                    {isAvailable ? 'Sẵn sàng' : slot.status === 'BOOKED' ? 'Hết chỗ' : 'Đã giữ chỗ'}
                                  </span>
                                  {isSelected && (
                                    <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-white shadow-sm ring-2 ring-white">
                                      <Check className="h-3 w-3" />
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
              )}
            </div>

            {/* Phần 3: Thông tin khách hàng */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-600 font-bold border border-accent-100">
                  3
                </div>
                <h2 className="text-lg font-bold text-foreground">Thông tin khách hàng</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Họ và tên
                  </label>
                  <Input 
                    placeholder="VD: Nguyễn Văn A" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Số điện thoại
                  </label>
                  <Input 
                    placeholder="VD: 0987654321" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Email
                  </label>
                  <Input 
                    placeholder="VD: example@mail.com" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Ghi chú của khách
                  </label>
                  <Textarea 
                    placeholder="Khách có yêu cầu gì đặc biệt không?..." 
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Phần 4: Thanh toán */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-600 font-bold border border-accent-100">
                  4
                </div>
                <h2 className="text-lg font-bold text-foreground">Thanh toán (Admin)</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Phương thức thanh toán
                  </label>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    options={[
                      { value: 'CASH', label: 'Tiền mặt' },
                      { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
                      { value: 'MOMO', label: 'Ví MoMo' },
                    ]}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Mã giao dịch (nếu có)
                  </label>
                  <Input 
                    placeholder="VD: FT12345678" 
                    value={transactionNo}
                    onChange={(e) => setTransactionNo(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Ghi chú thanh toán
                  </label>
                  <Input 
                    placeholder="Ghi chú về thanh toán..." 
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                  />
                </div>



                <div className="sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-accent-500 focus:ring-accent-500"
                    />
                    <span className="text-sm font-medium text-secondary-700 group-hover:text-foreground transition-colors">
                      Gửi email xác nhận cho khách sau khi tạo
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Phần 5: Xác nhận giá */}
          <div className="space-y-6">
            <div className="sticky top-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-600 font-bold border border-accent-100">
                  5
                </div>
                <h2 className="text-lg font-bold text-foreground">Xác nhận giá</h2>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center text-secondary-600">
                  <span>Tiền thuê phòng</span>
                  <span className="font-semibold text-foreground">{formatCurrency(pricing.totalBasePrice)}</span>
                </div>
                
                {pricing.totalHolidaySurcharge > 0 && (
                  <div className="flex justify-between items-center text-secondary-600">
                    <span>Phụ phí ngày lễ</span>
                    <span className="font-bold text-danger-500">+{formatCurrency(pricing.totalHolidaySurcharge)}</span>
                  </div>
                )}

                {pricing.totalDiscountAmount > 0 && (
                  <div className="flex justify-between items-center text-secondary-600">
                    <span>Giảm giá chiến dịch</span>
                    <span className="font-bold text-success-600">-{formatCurrency(pricing.totalDiscountAmount)}</span>
                  </div>
                )}

                {pricing.totalComboDiscount > 0 && (
                  <div className="flex justify-between items-center text-secondary-600">
                    <span>Giảm giá Combo</span>
                    <span className="font-bold text-success-600">-{formatCurrency(pricing.totalComboDiscount)}</span>
                  </div>
                )}

                {pricing.breakdown && pricing.breakdown.length > 0 && (
                   <div className="mt-1 pt-1 border-t border-border/50 border-dotted space-y-1">
                      {pricing.breakdown.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] text-secondary-400 italic">
                           <span>{item.label}</span>
                           <span>{item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                   </div>
                )}

                <div className="my-2 border-t border-border border-dashed" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-foreground">Tổng cộng</span>
                  <span className="text-xl font-bold text-accent-500">
                    {isCalculating ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      formatCurrency(pricing.totalPrice)
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  className="w-full py-2.5 shadow-sm"
                  onClick={handleCreateBooking}
                  loading={isCreating || adminCreateBooking.isPending}
                  disabled={bookingSlotsPayload.length === 0}
                >
                  Tạo booking
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="mt-3 text-center text-xs text-secondary-500">
                  Trạng thái mặc định: <strong className="text-warning-600">PENDING</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
