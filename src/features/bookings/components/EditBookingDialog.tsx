import { useState } from 'react';
import {
  ArrowDown,
  Calendar,
  Pencil,
  TriangleAlert,
  Check,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/utils';

type EditBookingDialogProps = {
  open: boolean;
  onClose: () => void;
  bookingCode: string;
};

export function EditBookingDialog({
  open,
  onClose,
  bookingCode,
}: EditBookingDialogProps) {
  const [selectedRoom, setSelectedRoom] = useState('Phòng Vintage');
  const [selectedDate, setSelectedDate] = useState('2026-03-03');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('14:00 - 18:00');
  const [sendEmail, setSendEmail] = useState(true);

  // Mock data for time slots 
  const timeSlots = [
    { time: '08:00 - 12:00', label: 'Đã đặt', disabled: true },
    { time: '12:00 - 14:00', label: 'Trống', disabled: false },
    { time: '14:00 - 18:00', label: 'Trống', disabled: false },
    { time: '18:00 - 22:00', label: 'Trống', disabled: false },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg" // lg matches the wider look in the screenshot
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-50 text-accent-500">
            <Pencil className="h-4 w-4" />
          </div>
          Sửa booking {bookingCode}
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="border-border">
            Đóng
          </Button>
          <Button
            className="bg-accent-400 text-white hover:bg-accent-500"
            onClick={onClose}
          >
            Xác nhận thay đổi
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Warning Alert */}
        <div className="flex items-start gap-3 rounded-xl bg-warning-50 px-4 py-3 text-sm text-warning-800 border border-warning-100">
          <div className="mt-0.5 shrink-0 flex items-center justify-center text-warning-500">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold mb-0.5">Cảnh báo thay đổi</p>
            <p className="text-warning-700">
              Lưu ý: Booking cũ và mật khẩu Tuya hiện tại sẽ bị xóa và thay thế bằng thông tin mới ngay sau khi xác nhận.
            </p>
          </div>
        </div>

        {/* Current Booking Header */}
        <div className="relative">
          <div className="rounded-xl border border-border bg-secondary-50 p-4 pb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wider text-secondary-500 uppercase">
                BOOKING HIỆN TẠI
              </span>
              <span className="rounded bg-danger-50 px-2 py-0.5 text-[10px] font-semibold text-danger-500">
                Sẽ bị xóa
              </span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=150&h=150"
                alt="Room"
                className="h-14 w-14 rounded-lg object-cover shadow-sm bg-secondary-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">Phòng Cinema</p>
                <div className="mt-1 flex items-center gap-4 text-xs font-medium text-secondary-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    01/03/2026
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-secondary-300" />
                    18:00 - 08:00
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-secondary-400 line-through decoration-danger-400">546.250đ</p>
              </div>
            </div>
          </div>

          {/* Down Arrow Separator */}
          <div className="absolute -bottom-3 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-accent-200 bg-white text-accent-500 shadow-sm z-10">
            <ArrowDown className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* New Booking Section */}
        <div className="rounded-xl border-2 border-accent-100 bg-surface p-5 pt-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-400" />
            <h3 className="font-bold text-foreground">Booking mới</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-secondary-500">
                Chọn phòng mới
              </label>
              <Select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                options={[
                  { value: 'Phòng Cinema', label: 'Phòng Cinema' },
                  { value: 'Phòng Vintage', label: 'Phòng Vintage' },
                ]}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-secondary-500">
                Chọn ngày mới
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-semibold text-secondary-500">
              Chọn khung giờ mới
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {timeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot.time;
                return (
                  <button
                    key={slot.time}
                    disabled={slot.disabled}
                    onClick={() => setSelectedTimeSlot(slot.time)}
                    className={cn(
                      'relative flex flex-col items-center justify-center rounded-lg border p-3 text-sm transition-all',
                      slot.disabled
                        ? 'border-border bg-secondary-50 opacity-60 cursor-not-allowed'
                        : isSelected
                          ? 'border-accent-400 bg-accent-50/50 shadow-[0_0_0_1px_var(--color-accent-400)]'
                          : 'border-border bg-surface hover:border-secondary-300'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-white">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                    <span
                      className={cn(
                        'font-bold',
                        slot.disabled ? 'text-secondary-400' : isSelected ? 'text-accent-600' : 'text-foreground'
                      )}
                    >
                      {slot.time}
                    </span>
                    <span
                      className={cn(
                        'mt-1 text-[10px] uppercase font-semibold',
                        slot.disabled ? 'text-danger-400' : isSelected ? 'text-accent-500' : 'text-secondary-400'
                      )}
                    >
                      {slot.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="rounded-xl bg-[#F0F7FF] px-5 py-4 border border-[#D6E8FF]">
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-secondary-500">Giá cũ</span>
              <span className="font-bold text-secondary-400">546.250đ</span>
            </div>
            
            <div className="flex h-5 w-5 items-center justify-center text-secondary-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                </svg>
            </div>

            <div className="flex flex-col gap-1 text-center">
              <span className="text-xs font-semibold text-secondary-500">Giá mới</span>
              <span className="text-base font-bold text-foreground">200.000đ</span>
            </div>
            
            <div className="h-10 w-px bg-border/80 mx-2" />

            <div className="flex flex-col gap-1 text-right">
              <span className="text-xs font-semibold text-secondary-500">Chênh lệch</span>
              <span className="font-bold text-success-600">-346.250đ</span>
            </div>
          </div>
        </div>

        {/* Note check */}
        <label className="flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="h-4 w-4 rounded border-border text-accent-500 focus:ring-accent-500 accent-accent-500"
          />
          <span className="text-sm font-medium text-secondary-700">
            Gửi email xác nhận booking mới cho khách hàng (kèm mật khẩu cửa mới).
          </span>
        </label>

      </div>
    </Modal>
  );
}
