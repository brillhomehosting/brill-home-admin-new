import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { Select } from '@/shared/components/ui/Select';
import { Textarea } from '@/shared/components/ui/Textarea';
import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { useBookingMutation } from '../hooks/useBookingMutation';

type CancelBookingDialogProps = {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  bookingCode: string;
  roomName: string;
  customerName: string;
  checkInDate: string;
  totalAmountStr: string;
};

export function CancelBookingDialog({
  open,
  onClose,
  bookingId,
  bookingCode,
  roomName,
  customerName,
  checkInDate,
  totalAmountStr,
}: CancelBookingDialogProps) {
  const [refundEnabled, setRefundEnabled] = useState(true);
  const [refundAmount, setRefundAmount] = useState('546.250');
  const [reason, setReason] = useState('Khách yêu cầu hủy');
  const [note, setNote] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  const { cancelBooking } = useBookingMutation();

  const handleCancel = async () => {
    // Combine base reason and internal note if needed, 
    // but the API specifically asks for cancellationReason.
    const fullReason = note ? `${reason}: ${note}` : reason;
    
    await cancelBooking.mutateAsync({ 
      bookingId, 
      reason: fullReason 
    });
    
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-danger-50 text-danger-500">
            <TriangleAlert className="h-4 w-4" />
          </div>
          Hủy booking {bookingCode}
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="border-border" disabled={cancelBooking.isPending}>
            Đóng
          </Button>
          <Button variant="danger" onClick={handleCancel} loading={cancelBooking.isPending}>
            Xác nhận hủy booking
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Warning Alert */}
        <div className="flex items-start gap-3 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">
          <div className="mt-0.5 shrink-0 flex items-center justify-center bg-danger-500 rounded-full h-4 w-4 text-white">
            <span className="font-bold text-[10px]">!</span>
          </div>
          <p>
            Hành động này <strong className="font-semibold">không thể hoàn tác</strong>. Mật khẩu cửa thông minh Tuya đã cấp cho khách hàng sẽ bị xóa vĩnh viễn khỏi hệ thống ngay lập tức.
          </p>
        </div>

        {/* Info Block */}
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-secondary-50 p-4">
          <div>
            <p className="text-xs font-semibold text-secondary-500">Phòng</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{roomName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary-500">Ngày check-in</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{checkInDate}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary-500">Khách hàng</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{customerName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary-500">Tổng thanh toán</p>
            <p className="mt-1 text-sm font-semibold text-accent-500">{totalAmountStr}</p>
          </div>
        </div>

        {/* Refund Block */}
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Hoàn tiền cho khách</p>
              <p className="text-xs text-secondary-400">Xử lý hoàn tiền về ví gốc trong 3-7 ngày</p>
            </div>
            {/* Toggle Switch */}
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={refundEnabled}
                onChange={(e) => setRefundEnabled(e.target.checked)}
              />
              <div className="h-6 w-11 rounded-full bg-secondary-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent-400 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" />
            </label>
          </div>

          {refundEnabled && (
            <div className="mt-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-secondary-500">
                SỐ TIỀN HOÀN (VNĐ)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-secondary-400">
                  đ
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Reason Select */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Lý do hủy <span className="text-danger-500">*</span>
          </label>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              { value: 'Khách yêu cầu hủy', label: 'Khách yêu cầu hủy' },
              { value: 'Không thể liên lạc khách', label: 'Không thể liên lạc khách' },
              { value: 'Sự cố phòng', label: 'Sự cố phòng' },
              { value: 'Hủy nội bộ', label: 'Hủy nội bộ' },
            ]}
          />
        </div>

        {/* Note */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-foreground">
            Ghi chú nội bộ
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập thêm chi tiết về việc hủy phòng..."
            rows={3}
          />
        </div>

        {/* Note check */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="h-4 w-4 rounded border-border text-accent-500 focus:ring-accent-500 accent-accent-500"
          />
          <span className="text-sm font-medium text-secondary-700">
            Gửi email thông báo hủy cho khách hàng
          </span>
        </label>
      </div>
    </Modal>
  );
}
