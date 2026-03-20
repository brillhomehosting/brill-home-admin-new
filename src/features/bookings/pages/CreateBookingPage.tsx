import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, PageWrapper } from '@/shared/components/layout';
import { ROUTES } from '@/shared/constants';
import { Select } from '@/shared/components/ui/Select';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Button } from '@/shared/components/ui/Button';
import { ChevronRight, UploadCloud, Check, X } from 'lucide-react';
import { cn } from '@/shared/utils';

export default function CreateBookingPage() {
  const navigate = useNavigate();
  
  // Section 1 State
  const [selectedRoom, setSelectedRoom] = useState('Phòng Cinema');
  const [selectedDate, setSelectedDate] = useState('2026-03-03');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Section 2 State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const timeSlots = [
    { id: 't1', time: '08:00 - 12:00', status: 'Trống' },
    { id: 't2', time: '12:00 - 14:00', status: 'Đang giữ chỗ' },
    { id: 't3', time: '14:00 - 18:00', status: 'Trống' },
    { id: 't4', time: '18:00 - 22:00', status: 'Trống' },
    { id: 't5', time: '22:00 - 08:00', status: 'Đã đặt' },
  ];

  const handleSlotToggle = (id: string, status: string) => {
    if (status !== 'Trống') return;
    setSelectedSlots((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn! Vui lòng chọn ảnh dưới 5MB.');
      // Reset input value so the same file could be selected again
      e.target.value = '';
      return;
    }

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Định dạng không hợp lệ. Vui lòng chọn JPG hoặc PNG.');
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'front') setFrontImage(previewUrl);
    else setBackImage(previewUrl);
    e.target.value = '';
  };

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
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    options={[
                      { value: 'Phòng Cinema', label: 'Phòng Cinema' },
                      { value: 'Phòng Vintage', label: 'Phòng Vintage' },
                      { value: 'Phòng Minimalist', label: 'Phòng Minimalist' },
                    ]}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlots.includes(slot.id);
                    const isAvailable = slot.status === 'Trống';
                    
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSlotToggle(slot.id, slot.status)}
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
                          {slot.time}
                        </span>
                        <span className={cn(
                          'text-[10px] font-semibold uppercase',
                          slot.status === 'Trống' ? 'text-success-600' : slot.status === 'Đang giữ chỗ' ? 'text-warning-600' : 'text-danger-500'
                        )}>
                          {slot.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
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
                    {frontImage ? (
                      <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary-50">
                        <img src={frontImage} alt="CCCD Front" className="h-full w-full object-cover" />
                        <button 
                          onClick={() => setFrontImage(null)}
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
                          onChange={(e) => handleFileUpload(e, 'front')}
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
                    {backImage ? (
                      <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary-50">
                        <img src={backImage} alt="CCCD Back" className="h-full w-full object-cover" />
                        <button 
                          onClick={() => setBackImage(null)}
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
                          onChange={(e) => handleFileUpload(e, 'back')}
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
                  <span>Giá phòng gốc</span>
                  <span className="font-semibold text-foreground">500.000đ</span>
                </div>
                <div className="flex justify-between items-center text-secondary-600">
                  <span>Phụ thu lễ rằm</span>
                  <span className="font-semibold text-foreground">+50.000đ</span>
                </div>
                <div className="flex justify-between items-center text-secondary-600">
                  <span>Mã giảm giá</span>
                  <span className="font-semibold text-success-600">-0đ</span>
                </div>
                <div className="my-2 border-t border-border border-dashed" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-foreground">Tổng cộng</span>
                  <span className="text-xl font-bold text-accent-500">550.000đ</span>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  className="w-full bg-accent-500 text-white hover:bg-accent-600 py-2.5 shadow-sm"
                  onClick={() => navigate('/apps/bookings')}
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
