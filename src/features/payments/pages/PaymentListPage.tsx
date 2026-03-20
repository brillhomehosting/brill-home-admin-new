import { useState } from 'react';
import { Header, PageWrapper } from '@/shared/components/layout';
import { Pagination } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import {
  CalendarDays,
  ChevronDown,
  Search,
  Download,
  Banknote,
  Calendar,
  Hourglass,
  RefreshCcw,
} from 'lucide-react';
import { PaymentDetailDrawer } from '../components/PaymentDetailDrawer';
import { ROUTES } from '@/shared/constants';

// --- Types & Mock Data ---

type PaymentStatus = 'Thành công' | 'Pending' | 'Đã hoàn tiền' | 'Thất bại';
type PaymentMethod = 'VNPay' | 'MoMo' | 'CASH' | 'BANK_TRANSFER' | 'OTHER';

type Payment = {
  id: string;
  paymentCode: string;
  bookingCode: string;
  guestName: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
};

const mockPayments: Payment[] = [
  {
    id: '1',
    paymentCode: 'VNP140328...',
    bookingCode: '#BK-A1F3C2',
    guestName: 'Nguyễn Thị Mai',
    amount: '546.250đ',
    method: 'VNPay',
    status: 'Thành công',
    createdAt: '14/03 10:30',
  },
  {
    id: '2',
    paymentCode: 'MOMO26030...',
    bookingCode: '#BK-B2D4E5',
    guestName: 'Trần Văn Hùng',
    amount: '200.000đ',
    method: 'MoMo',
    status: 'Thành công',
    createdAt: '14/03 11:15',
  },
  {
    id: '3',
    paymentCode: 'VNP140329...',
    bookingCode: '#BK-F6B8C9',
    guestName: 'Lý Minh Châu',
    amount: '350.000đ',
    method: 'VNPay',
    status: 'Pending',
    createdAt: '14/03 11:45',
  },
  {
    id: '4',
    paymentCode: 'MOMO26031...',
    bookingCode: '#BK-C3E5F6',
    guestName: 'Lê Thị Hoa',
    amount: '350.000đ',
    method: 'MoMo',
    status: 'Thành công',
    createdAt: '14/03 12:20',
  },
  {
    id: '5',
    paymentCode: 'VNP140330...',
    bookingCode: '#BK-D4F6A7',
    guestName: 'Phạm Minh Tuấn',
    amount: '410.400đ',
    method: 'VNPay',
    status: 'Đã hoàn tiền',
    createdAt: '14/03 13:00',
  },
  {
    id: '6',
    paymentCode: 'VNP140331...',
    bookingCode: '#BK-G7C9D0',
    guestName: 'Võ Thị Tuyết',
    amount: '480.000đ',
    method: 'VNPay',
    status: 'Thất bại',
    createdAt: '14/03 13:45',
  },
];

const statusStyles: Record<PaymentStatus, string> = {
  'Thành công': 'bg-success-100/50 text-success-600',
  'Pending': 'bg-warning-100/50 text-warning-600',
  'Đã hoàn tiền': 'bg-danger-100/50 text-danger-600',
  'Thất bại': 'bg-secondary-100 text-secondary-500',
};

const methodColors: Record<PaymentMethod, string> = {
  VNPay: 'bg-blue-500',
  MoMo: 'bg-pink-500',
  CASH: 'bg-green-500',
  BANK_TRANSFER: 'bg-indigo-500',
  OTHER: 'bg-secondary-500',
};

// --- Component ---

export default function PaymentListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setDrawerOpen(true);
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Quản lý thanh toán"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.HOME },
          { label: 'Quản lý thanh toán' },
        ]} 
        actions={
          <button className="flex items-center gap-2 rounded-lg bg-orange-300 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-400 transition-colors">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </button>
        }
      />

      <PageWrapper className="flex-1 space-y-6">
        
        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-500">
                <Banknote className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                12%
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-secondary-500 tracking-wide uppercase">Doanh thu hôm nay</p>
              <p className="mt-1.5 text-2xl font-black text-secondary-900 tracking-tight">4.850.000đ</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                5%
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-secondary-500 tracking-wide uppercase">Doanh thu tháng 3</p>
              <p className="mt-1.5 text-2xl font-black text-secondary-900 tracking-tight">32.450.000đ</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50 text-warning-500">
                <Hourglass className="h-5 w-5" />
              </div>
              <span className="flex items-center justify-center h-5 w-5 text-[10px] font-bold text-secondary-500 bg-secondary-100 rounded-full">
                0
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-secondary-500 tracking-wide uppercase">Giao dịch Pending</p>
              <p className="mt-1.5 text-2xl font-black text-secondary-900 tracking-tight">3</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-50 text-danger-500">
                <RefreshCcw className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                2%
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-secondary-500 tracking-wide uppercase">Hoàn tiền tháng này</p>
              <p className="mt-1.5 text-2xl font-black text-secondary-900 tracking-tight">1.200.000đ</p>
            </div>
          </div>
        </div>

        {/* --- List Section --- */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm">
          
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative w-36 shrink-0">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Từ ngày"
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                  />
                </div>
                <span className="text-secondary-400 font-medium">-</span>
                <div className="relative w-36 shrink-0">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Đến ngày"
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="relative w-36 shrink-0">
                <select className="w-full appearance-none rounded-lg border border-border bg-transparent py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500">
                  <option value="ALL">Tất cả cổng</option>
                  <option value="VNPAY">VNPay</option>
                  <option value="MOMO">MoMo</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-secondary-400" />
              </div>

              <div className="relative w-40 shrink-0">
                <select className="w-full appearance-none rounded-lg border border-border bg-transparent py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary-500">
                  <option value="ALL">Mọi trạng thái</option>
                  <option value="SUCCESS">Thành công</option>
                  <option value="PENDING">Pending</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-secondary-400" />
              </div>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="Tìm theo mã GD, mã booking..."
                className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-dim uppercase text-secondary-500 text-xs font-semibold tracking-wider border-b border-border">
                <tr>
                  <th scope="col" className="px-5 py-4">Mã giao dịch</th>
                  <th scope="col" className="px-5 py-4">Mã booking</th>
                  <th scope="col" className="px-5 py-4">Cổng TT</th>
                  <th scope="col" className="px-5 py-4">Khách hàng</th>
                  <th scope="col" className="px-5 py-4">Số tiền</th>
                  <th scope="col" className="px-5 py-4 text-center">Trạng thái</th>
                  <th scope="col" className="px-5 py-4">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockPayments.map((pm) => (
                  <tr 
                    key={pm.id} 
                    onClick={() => handleRowClick(pm)}
                    className="hover:bg-secondary-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-foreground">
                      {pm.paymentCode}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-accent-500">{pm.bookingCode}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <span className={cn('h-1.5 w-1.5 rounded-full', methodColors[pm.method])} />
                        {pm.method}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-secondary-600">
                      {pm.guestName}
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">
                      {pm.amount}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', statusStyles[pm.status])}>
                        {pm.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-secondary-600">
                      {pm.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border px-4 py-4 sm:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={8}
              onPageChange={setCurrentPage}
              summary="Đang hiển thị 1 đến 6 trong tổng số 128 kết quả"
            />
          </div>
        </div>
      </PageWrapper>

      {/* Drawer Overlay */}
      <PaymentDetailDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        data={selectedPayment}
      />
    </div>
  );
}
