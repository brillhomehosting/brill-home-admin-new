import {
  X,
  Copy,
  ExternalLink,
  User as UserIcon,
  Receipt,
  Eye,
  RefreshCcw,
  CreditCard
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  data: any | null; // Pass payment object here
  onRefundClick?: () => void;
};

export function PaymentDetailDrawer({ open, onClose, data, onRefundClick }: DrawerProps) {
  if (!open || !data) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-overlay bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-[4001] w-full max-w-[420px] bg-surface shadow-2xl flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Chi tiết giao dịch</h2>
              <span className="rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-bold text-success-600">
                Thành công
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-secondary-500">
              Mã GD: <span className="font-semibold text-secondary-700">{data.transactionNo || data.paymentCode}</span>
              <button className="text-secondary-400 hover:text-accent-500 transition-colors" title="Copy mã">
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-secondary-400 hover:bg-secondary-50 hover:text-secondary-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 mb-1">Cổng thanh toán</p>
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-secondary-100 text-[10px] font-bold text-secondary-700">VP</span>
                VNPay
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 mb-1">Mã Booking</p>
              <div className="flex items-center gap-1 font-semibold text-accent-500 text-sm hover:underline cursor-pointer">
                {data.bookingCode} <ExternalLink className="h-3 w-3" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 mb-1">Số tiền</p>
              <p className="text-base font-bold text-foreground">{data.amount}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 mb-1">Bank Code</p>
              <p className="text-sm font-semibold text-foreground">NCB</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 mb-1">Thời gian tạo</p>
              <p className="text-xs font-semibold text-foreground">01/03/2026 - 14:30:22</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 mb-1">Thời gian TT</p>
              <p className="text-xs font-semibold text-foreground">01/03/2026 - 14:31:05</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 mb-1">Loại thẻ</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CreditCard className="h-4 w-4 text-secondary-400" />
                ATM Nội địa
              </div>
            </div>
          </div>

          {/* User Section */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
              <UserIcon className="h-4 w-4 text-warning-500" />
              Thông tin khách hàng
            </h3>
            <div className="rounded-xl border border-border bg-secondary-50 p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-foreground mb-1">{data.guestName}</p>
                <p className="text-xs text-primary-600 font-medium tracking-wide">0901 234 567</p>
                <p className="text-xs text-primary-600 font-medium">mai.nguyen@example.com</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning-100 text-warning-600 font-bold text-sm">
                M
              </div>
            </div>
          </div>

          {/* Order Section */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
              <Receipt className="h-4 w-4 text-warning-500" />
              Chi tiết đơn hàng
            </h3>
            <div className="rounded-xl border border-border bg-surface shadow-sm">
              <div className="flex items-center justify-between border-b border-border p-4">
                <span className="font-bold text-sm text-foreground">{data.roomName}</span>
                <span className="text-xs font-medium text-secondary-400">01/03/2026</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-medium text-foreground">Gói 3 giờ (14:00 - 17:00)</p>
                    <p className="text-[10px] text-secondary-400 mt-0.5">Đơn giá: 150.000đ/h</p>
                  </div>
                  <span className="font-semibold text-foreground">450.000đ</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-foreground">Combo Đồ uống + Snack</span>
                  <span className="font-semibold text-foreground">125.000đ</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-foreground">Giảm giá (Voucher: HELLO26)</span>
                  <span className="font-semibold text-danger-500">-28.750đ</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-border p-4 bg-secondary-50 rounded-b-xl">
                <span className="font-bold text-sm text-foreground">Tổng cộng</span>
                <span className="font-bold text-lg text-accent-500">{data.amount}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-surface flex items-center justify-between gap-3">
          <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2 font-semibold text-primary-600 hover:text-primary-700">
            <Eye className="h-4 w-4" />
            <span>Xem booking</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1 flex items-center justify-center gap-2 border-danger-200 text-danger-500 hover:bg-danger-50 font-semibold"
            onClick={onRefundClick}
          >
            <RefreshCcw className="h-4 w-4" />
            Hoàn tiền
          </Button>
        </div>
      </div>
    </>
  );
}
