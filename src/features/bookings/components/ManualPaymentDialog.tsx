import { useState, useEffect } from 'react';
import {
  CheckCircle,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { useBookingMutation } from '../hooks/useBookingMutation';
import { formatCurrency } from '@/shared/utils';
import type { PaymentMethod } from '@/shared/types';

type ManualPaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  bookingCode: string;
  roomName: string;
  dateInfo: string;
  customerName: string;
  totalAmount: number;
};

export function ManualPaymentDialog({
  open,
  onClose,
  bookingId,
  bookingCode,
  roomName,
  dateInfo,
  customerName,
  totalAmount,
}: ManualPaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [amountStr, setAmountStr] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  const { confirmPayment } = useBookingMutation();

  // Reset/Initialize state when open
  useEffect(() => {
    if (open) {
      setAmountStr(totalAmount.toLocaleString('vi-VN'));
      setPaymentMethod('BANK_TRANSFER');
      setTransactionCode('');
      setNote('');
      setImages([]);
      setIsConfirming(false);
    }
  }, [open, totalAmount]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 3) {
      alert('Chỉ được tải lên tối đa 3 ảnh.');
      return;
    }

    const newImages: string[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} quá lớn. Tối đa 5MB.`);
        continue;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert(`Định dạng ${file.name} không hợp lệ.`);
        continue;
      }
      newImages.push(URL.createObjectURL(file));
    }

    setImages([...images, ...newImages]);
    e.target.value = ''; // Reset
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleConfirmSubmit = () => {
    setIsConfirming(true);
  };

  const finalizePayment = async () => {
    // Convert amount string "546.250" to number 546250
    const numericAmount = Number(amountStr.replace(/\./g, '').replace(/,/g, ''));

    await confirmPayment.mutateAsync({
      bookingId,
      data: {
        paymentMethod,
        amount: numericAmount,
        transactionNo: transactionCode,
        proofImageUrls: images, // In a real app, these would be uploaded URLs
        note: note || `Admin xác nhận thanh toán thủ công (${paymentMethod})`,
      },
    });

    setIsConfirming(false);
    onClose();
  };

  const isBankTransfer = paymentMethod === 'BANK_TRANSFER';
  const isValid = !isBankTransfer || images.length > 0;

  return (
    <>
      <Modal
        open={open && !isConfirming}
        onClose={onClose}
        size="lg" // Make it slightly wider to fit all the info
        title={
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success-50 text-success-500">
              <CheckCircle className="h-4 w-4" />
            </div>
            Tạo Payment Thủ Công
          </div>
        }
        footer={
          <>
            <Button variant="secondary" onClick={onClose} className="border-border px-5">
              Đóng
            </Button>
            <Button
              className="bg-success-500 text-white hover:bg-success-600 px-5"
              onClick={handleConfirmSubmit}
              disabled={!isValid}
            >
              Xác nhận thanh toán
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          
          {/* Phần 1: Thông tin booking (read-only) */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-100 text-xs text-secondary-600">1</span>
              Thông tin Booking
            </h3>
            <div className="rounded-xl border border-border bg-secondary-50 p-4">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-secondary-500">Mã booking</span>
                  <span className="font-bold text-foreground text-base tracking-tight">{bookingCode}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-secondary-500">Tên phòng</span>
                  <span className="font-semibold text-foreground">{roomName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-secondary-500">Ngày / Khung giờ</span>
                  <span className="font-semibold text-foreground">{dateInfo}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-secondary-500">Khách hàng</span>
                  <span className="font-semibold text-foreground">{customerName}</span>
                </div>
              </div>
              <div className="mt-3 border-t border-border pt-3 flex justify-between items-center text-sm">
                <span className="text-secondary-500 font-semibold">Tổng tiền cần thanh toán</span>
                <span className="text-lg font-bold text-accent-500">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Phần 2: Thông tin payment */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-100 text-xs text-secondary-600">2</span>
              Thông tin Payment
            </h3>
            <div className="grid grid-cols-1 gap-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                    Phương thức thanh toán <span className="text-danger-500">*</span>
                  </label>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    options={[
                      { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
                      { value: 'CASH', label: 'Tiền mặt' },
                      { value: 'VNPAY', label: 'VNPay' },
                      { value: 'MOMO', label: 'MoMo' },
                      { value: 'OTHER', label: 'Khác' },
                    ]}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                    Số tiền thực nhận <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={amountStr}
                      onChange={(e) => setAmountStr(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-sm font-bold outline-none transition-colors focus:border-primary-500"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-sm font-bold text-secondary-500">đ</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                  Mã giao dịch (Optional)
                </label>
                <Input
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value)}
                  placeholder="VD: Mã chuyển khoản, mã giao dịch rắc rối..."
                />
              </div>

              {/* Upload Ảnh */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-secondary-500">
                  <span>
                    Hình ảnh chứng từ (Tối đa 3 ảnh) 
                    {isBankTransfer && <span className="text-danger-500 ml-1">*</span>}
                  </span>
                  <span className="text-secondary-400 font-normal">{images.length}/3</span>
                </label>
                
                <div className="flex flex-wrap gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative h-24 w-24 rounded-lg border border-border bg-secondary-50 overflow-hidden group">
                      <img src={img} alt="Bill" className="h-full w-full object-cover" />
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {images.length < 3 && (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-dim transition-colors hover:bg-secondary-50">
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={handleFileUpload}
                      />
                      <ImageIcon className="h-6 w-6 text-secondary-400 mb-1" />
                      <span className="text-[10px] font-medium text-secondary-500">Thêm ảnh</span>
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                  Ghi chú payment (Optional)
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Khách trả tiền mặt tại quầy..."
                  rows={2}
                />
              </div>

            </div>
          </div>

        </div>
      </Modal>

      {/* Phần 3: Xác nhận - System Confirm Dialog equivalent */}
      <Modal
        open={isConfirming}
        onClose={() => setIsConfirming(false)}
        size="sm"
        title="Xác nhận thanh toán"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirming(false)} disabled={confirmPayment.isPending}>
              Hủy
            </Button>
            <Button className="bg-success-500 text-white hover:bg-success-600" onClick={finalizePayment} loading={confirmPayment.isPending}>
              Đồng ý
            </Button>
          </>
        }
      >
        <p className="text-secondary-700 text-sm">
          Xác nhận khách đã thanh toán <strong className="text-foreground">{amountStr} VNĐ</strong> cho booking <strong className="text-foreground">{bookingCode}</strong>?
        </p>
      </Modal>
    </>
  );
}
