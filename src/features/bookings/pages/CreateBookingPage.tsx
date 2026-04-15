import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, PageWrapper } from '@/shared/components/layout';
import { ROUTES } from '@/shared/constants';
import { Select } from '@/shared/components/ui/Select';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Button } from '@/shared/components/ui/Button';
import { ChevronRight, UploadCloud, Check, X, Loader2 } from 'lucide-react';
import { cn, formatCurrency } from '@/shared/utils';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import { useTimeSlotAvailability } from '@/features/rooms/hooks/useTimeSlotBooking';
import { useBookingMutation } from '../hooks/useBookingMutation';
import { roomService } from '@/shared/services/room.service';
import { useToast } from '@/shared/components/feedback/Toast';

export default function CreateBookingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Section 1 State
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  // Section 2 State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [note, setNote] = useState('');

  // Local previews
  const frontPreview = useMemo(() => frontFile ? URL.createObjectURL(frontFile) : null, [frontFile]);
  const backPreview = useMemo(() => backFile ? URL.createObjectURL(backFile) : null, [backFile]);

  // Queries & Mutations
  const { data: roomsResponse, isLoading: isLoadingRooms } = useRooms({ limit: 100 });
  const rooms = roomsResponse?.data?.content || [];

  const { data: slots, isLoading: isLoadingSlots } = useTimeSlotAvailability(
    selectedRoomId,
    selectedDate
  );

  const { adminCreateBooking } = useBookingMutation();

  const handleSlotToggle = (id: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSelectedSlotIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('File quá lớn! Vui lòng chọn ảnh dưới 5MB.', 'error');
      e.target.value = '';
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast('Định dạng không hợp lệ. Vui lòng chọn JPG hoặc PNG.', 'error');
      e.target.value = '';
      return;
    }

    if (type === 'front') setFrontFile(file);
    else setBackFile(file);
    
    e.target.value = ''; // Reset input to allow re-selecting same file
  };

  const handleCreateBooking = async () => {
    if (!selectedRoomId || !selectedDate || selectedSlotIds.length === 0) {
      toast('Vui lòng chọn đầy đủ phòng, ngày và khung giờ', 'warning');
      return;
    }

    if (!customerEmail || !customerName || !customerPhone || !frontFile || !backFile) {
      toast('Vui lòng nhập đầy đủ thông tin khách hàng và chọn ảnh CCCD', 'warning');
      return;
    }

    try {
      setIsCreating(true);

      // 1. Upload files first
      const [frontRes, backRes] = await Promise.all([
        roomService.uploadCredentials(frontFile),
        roomService.uploadCredentials(backFile)
      ]);

      // 2. Create booking with URLs
      await adminCreateBooking.mutateAsync({
        roomId: selectedRoomId,
        date: selectedDate,
        timeSlotIds: selectedSlotIds,
        guestName: customerName,
        guestEmail: customerEmail,
        guestPhone: customerPhone,
        nationalIdFrontUrl: frontRes.url,
        nationalIdBackUrl: backRes.url,
        note: note || 'Booking được tạo bởi Admin',
      });

      toast('Tạo booking thành công', 'success');
      navigate('/apps/bookings');
    } catch (error) {
      toast('Có lỗi xảy ra khi tạo booking. Vui lòng thử lại.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const totalPrice = useMemo(() => {
    if (!slots || selectedSlotIds.length === 0) return 0;
    return slots
      .filter(s => selectedSlotIds.includes(s.timeSlot.id))
      .reduce((sum, s) => sum + (s.timeSlot.price || 0), 0);
  }, [slots, selectedSlotIds]);

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Tạo booking thủ công"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Đặt phòng', path: '/apps/bookings' },
          { label: 'Tạo booking mới' },
        ]}
      />

      <PageWrapper className="flex-1 space-y-6 pb-20 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Phần 1: Chọn phòng & khung giờ */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-600 font-bold border border-accent-100">
                  1
                </div>
                <h2 className="text-lg font-bold text-foreground">Chọn phòng & khung giờ</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Phòng <span className="text-danger-500">*</span>
                  </label>
                  <Select
                    value={selectedRoomId}
                    onChange={(e) => {
                      setSelectedRoomId(e.target.value);
                      setSelectedSlotIds([]); // Reset slots when room changes
                    }}
                    placeholder="Chọn phòng..."
                    loading={isLoadingRooms}
                    options={rooms.map((r) => ({
                      value: r.id,
                      label: r.name,
                    }))}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Ngày đặt <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                  Khung giờ (Chọn 1 hoặc nhiều) <span className="text-danger-500">*</span>
                </label>
                
                {isLoadingSlots ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                ) : !selectedRoomId ? (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-secondary-400">
                    Vui lòng chọn phòng trước
                  </div>
                ) : !slots || slots.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-secondary-400">
                    Không có khung giờ nào cho ngày này
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((item) => {
                      const slot = item.timeSlot;
                      const isSelected = selectedSlotIds.includes(slot.id);
                      const isAvailable = item.status === 'AVAILABLE';
                      
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleSlotToggle(slot.id, isAvailable)}
                          disabled={!isAvailable}
                          className={cn(
                            'relative flex flex-col items-center justify-center rounded-lg border p-3 text-sm transition-all text-left w-full gap-1',
                            !isAvailable
                              ? 'border-border bg-secondary-50 cursor-not-allowed opacity-60'
                              : isSelected
                                ? 'border-accent-400 bg-accent-50/50 shadow-[0_0_0_1px_var(--color-accent-400)]'
                                : 'border-border bg-surface hover:border-secondary-300'
                          )}
                        >
                          {isSelected && (
                            <div className="absolute right-2 top-2 text-accent-500">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                          <span className={cn(
                            'font-bold',
                            !isAvailable ? 'text-secondary-400' : isSelected ? 'text-accent-600' : 'text-foreground'
                          )}>
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className={cn(
                            'text-[10px] font-semibold uppercase',
                            isAvailable ? 'text-success-600' : 'text-danger-500'
                          )}>
                            {isAvailable ? 'Trống' : 'Đã đặt'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Phần 2: Nhập thông tin khách */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-600 font-bold border border-accent-100">
                  2
                </div>
                <h2 className="text-lg font-bold text-foreground">Nhập thông tin khách</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Họ và tên <span className="text-danger-500">*</span>
                  </label>
                  <Input 
                    placeholder="VD: Nguyễn Văn A" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Số điện thoại <span className="text-danger-500">*</span>
                  </label>
                  <Input 
                    placeholder="VD: 0901234567" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Email <span className="text-danger-500">*</span>
                  </label>
                  <Input 
                    type="email"
                    placeholder="VD: email@example.com" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2 grid grid-cols-2 gap-4 mt-2">
                  {/* CCCD Mặt trước */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                      CCCD Mặt trước <span className="text-danger-500">*</span>
                    </label>
                    {frontPreview ? (
                      <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary-50">
                        <img src={frontPreview} alt="CCCD Front" className="h-full w-full object-cover" />
                        <button 
                          onClick={() => setFrontFile(null)}
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-dim p-4 transition-colors hover:bg-secondary-50">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={(e) => handleFileSelect(e, 'front')}
                        />
                        <div className="mb-2 rounded-full bg-primary-50 p-2 text-primary-500">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium text-primary-600">Tải trang trước lên</span>
                        <span className="mt-0.5 text-[10px] text-secondary-400">JPG, PNG (Max 5MB)</span>
                      </label>
                    )}
                  </div>
                  
                  {/* CCCD Mặt sau */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                      CCCD Mặt sau <span className="text-danger-500">*</span>
                    </label>
                    {backPreview ? (
                      <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary-50">
                        <img src={backPreview} alt="CCCD Back" className="h-full w-full object-cover" />
                        <button 
                          onClick={() => setBackFile(null)}
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-dim p-4 transition-colors hover:bg-secondary-50">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={(e) => handleFileSelect(e, 'back')}
                        />
                        <div className="mb-2 rounded-full bg-primary-50 p-2 text-primary-500">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium text-primary-600">Tải trang sau lên</span>
                        <span className="mt-0.5 text-[10px] text-secondary-400">JPG, PNG (Max 5MB)</span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    Ghi chú
                  </label>
                  <Textarea 
                    placeholder="Walk-in, Khách gọi điện đặt..." 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Phần 3: Xác nhận giá */}
          <div className="space-y-6">
            <div className="sticky top-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-600 font-bold border border-accent-100">
                  3
                </div>
                <h2 className="text-lg font-bold text-foreground">Xác nhận giá</h2>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center text-secondary-600">
                  <span>Tiền thuê phòng</span>
                  <span className="font-semibold text-foreground">{formatCurrency(totalPrice)}</span>
                </div>
                {/* Simplified surcharge for now */}
                <div className="flex justify-between items-center text-secondary-600">
                  <span>Phụ thu / Giảm giá</span>
                  <span className="font-semibold text-foreground">+0đ</span>
                </div>
                <div className="my-2 border-t border-border border-dashed" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-foreground">Tổng cộng</span>
                  <span className="text-xl font-bold text-accent-500">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  className="w-full py-2.5 shadow-sm"
                  onClick={handleCreateBooking}
                  loading={isCreating || adminCreateBooking.isPending}
                  disabled={selectedSlotIds.length === 0}
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
