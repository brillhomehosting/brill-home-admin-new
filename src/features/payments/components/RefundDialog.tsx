import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Input } from '@/shared/components/ui/Input';
import { RefreshCcw } from 'lucide-react';

type RefundDialogProps = {
  open: boolean;
  onClose: () => void;
  paymentCode: string;
  maxAmount: string;
};

export function RefundDialog({
  open,
  onClose,
  paymentCode,
  maxAmount,
}: RefundDialogProps) {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState(maxAmount);

  const handleSubmit = () => {
    // API Call here
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
            <RefreshCcw className="h-4 w-4" />
          </div>
          Hoàn tiền giao dịch
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="border-border px-5">
            Hủy
          </Button>
          <Button className="bg-primary-500 text-white hover:bg-primary-600 px-5" onClick={handleSubmit}>
            Hoàn tiền
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-secondary-600">
          Giao dịch <strong>{paymentCode}</strong>
        </p>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
            Số tiền hoàn (Mặc định toàn bộ) <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-3 pr-8 font-bold"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-sm font-bold text-secondary-500">đ</span>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
            Lý do hoàn tiền <span className="text-danger-500">*</span>
          </label>
          <Textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Khách hủy phòng đúng hạn..."
            rows={3}
          />
        </div>
      </div>
    </Modal>
  );
}
