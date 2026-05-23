import { useEffect, useState } from 'react';
import { Mail, Send, Ticket, Check } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { useBookingMutation } from '../hooks/useBookingMutation';

type ResendEmailDialogProps = {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  bookingCode: string;
  roomName: string;
  checkInDate: string;
  customerName: string;
  customerEmail: string;
};

export function ResendEmailDialog({
  open,
  onClose,
  bookingId,
  bookingCode,
  roomName,
  checkInDate,
  customerName,
  customerEmail,
}: ResendEmailDialogProps) {
  const [email, setEmail] = useState(customerEmail);
  const { resendConfirmation } = useBookingMutation();

  useEffect(() => {
    if (open) {
      setEmail(customerEmail);
    }
  }, [customerEmail, open]);

  const handleResend = async () => {
    await resendConfirmation.mutateAsync({ bookingId, email: email.trim() });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-500">
            <Mail className="h-4 w-4" />
          </div>
          Gửi lại email xác nhận
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="border-border px-5" disabled={resendConfirmation.isPending}>
            Đóng
          </Button>
          <Button
            className="flex items-center gap-1.5 px-5"
            onClick={handleResend}
            loading={resendConfirmation.isPending}
          >
            <Send className="h-4 w-4" />
            Gửi email
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Booking Summary Box */}
        <div className="rounded-xl border border-border p-4 shadow-sm bg-surface">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <Ticket className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {bookingCode} &middot; {roomName} &middot; {checkInDate}
              </p>
              <p className="mt-0.5 text-xs text-secondary-500">
                Khách: {customerName}
              </p>
            </div>
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">
            Gửi đến email:
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-secondary-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-secondary-400">
            Có thể thay đổi email nếu khách nhập sai ban đầu
          </p>
        </div>

        {/* Contents Included */}
        <div>
          <label className="mb-2.5 block text-xs font-semibold text-foreground">
            Nội dung email bao gồm:
          </label>
          <ul className="flex flex-col gap-2.5">
            {[
              'Mã đặt phòng',
              'Gate Pass & Room Pass',
              'Chi tiết phòng, ngày, giờ, giá',
              'Hướng dẫn check-in & địa chỉ',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-success-50 text-success-500">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span className="text-sm font-medium text-secondary-600">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
