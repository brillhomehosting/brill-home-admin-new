import { useState } from 'react';
import {
  X,
  Search,
  Check,
  Info,
  PlusCircle
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { cn } from '@/shared/utils';

type SurchargeDialogProps = {
  open: boolean;
  onClose: () => void;
  bookingCode: string;
};

export function SurchargeDialog({
  open,
  onClose,
  bookingCode,
}: SurchargeDialogProps) {
  const [selectedTimeSpan, setSelectedTimeSpan] = useState('20-30');
  const [amount, setAmount] = useState('250.000');
  const [note, setNote] = useState('Khách checkout trễ 25 phút. Xác nhận qua camera lúc 08:25.');
  const [sendEmail, setSendEmail] = useState(true);
  const [hasSelectedBooking, setHasSelectedBooking] = useState(true);

  const timeOptions = [
    { id: '10-20', time: '10-20 phút', price: '100.000đ' },
    { id: '20-30', time: '20-30 phút', price: '250.000đ' },
    { id: '30+', time: '> 30 phút', price: 'Tính 1 ngày' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-foreground">
          <span className="text-xl">💰</span>
          Tạo phụ thu checkout trễ
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="border-border px-5">
            Đóng
          </Button>
          <Button
            className="flex items-center gap-1.5 bg-warning-500 text-white hover:bg-warning-600 px-5"
            onClick={onClose}
          >
            <PlusCircle className="h-4 w-4" />
            Tạo phụ thu {amount}đ
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        
        {/* Select Booking Section */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-foreground">Chọn booking</h3>
          
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-secondary-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm booking hoặc tên khách hàng..."
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
            />
          </div>

          {hasSelectedBooking && (
            <div className="relative mt-1 flex items-start gap-3 rounded-xl bg-secondary-50 p-3 pr-10 border border-border">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100"
                alt="Avatar"
                className="h-10 w-10 rounded-full object-cover shrink-0 bg-secondary-200"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground">{bookingCode} &middot; Phòng Cinema</span>
                  <span className="rounded bg-success-100 px-1.5 py-0.5 text-[10px] font-semibold text-success-700">
                    Đã thanh toán
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-secondary-500">
                  Nguyễn Thị Mai &middot; 01/03/2026
                </p>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  Check-out thực tế: 08:00
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => setHasSelectedBooking(false)}
                className="absolute right-3 top-3 text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-border" />

        {/* Thông tin phụ thu Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground">Thông tin phụ thu</h3>

          {/* Thời gian trễ */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-secondary-500">
              Thời gian trễ <span className="text-danger-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {timeOptions.map((opt) => {
                const isSelected = selectedTimeSpan === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedTimeSpan(opt.id)}
                    className={cn(
                      'relative flex flex-col items-center justify-center rounded-lg border py-2.5 transition-all text-sm',
                      isSelected
                        ? 'border-warning-400 bg-warning-50/20 shadow-[0_0_0_1px_var(--color-warning-400)]'
                        : 'border-border bg-surface hover:border-secondary-300'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-warning-400 text-white">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        isSelected ? 'text-warning-600' : 'text-secondary-500'
                      )}
                    >
                      {opt.time}
                    </span>
                    <span className="font-bold text-foreground mt-0.5">
                      {opt.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Số tiền phụ thu */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-secondary-500">
              Số tiền phụ thu <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-sm font-bold outline-none transition-colors focus:border-primary-500"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-sm font-bold text-secondary-500">đ</span>
              </div>
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium italic text-secondary-500">
              <Info className="h-3 w-3" />
              Đã tự động điền theo mức tham khảo. Có thể chỉnh sửa.
            </p>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-secondary-500">
              Ghi chú <span className="text-danger-500">*</span>
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú chi tiết..."
              rows={3}
            />
          </div>

          {/* Checkbox send email */}
          <div className="mt-1 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="sendEmailSurcharge"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-warning-400 focus:ring-warning-400 accent-warning-500"
            />
            <label htmlFor="sendEmailSurcharge" className="flex flex-col cursor-pointer select-none">
              <span className="text-sm font-bold text-secondary-700">
                Gửi email thông báo phụ thu cho khách
              </span>
              <span className="text-[11px] font-medium text-secondary-500 mt-0.5">
                Khách hàng sẽ nhận được hóa đơn cập nhật ngay lập tức.
              </span>
            </label>
          </div>

        </div>
      </div>
    </Modal>
  );
}
