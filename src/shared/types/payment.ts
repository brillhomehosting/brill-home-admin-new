import type { PaymentMethod } from './booking';

export type PaymentStatus = 'PAID' | 'REFUNDED';

export type Payment = {
  paymentCode: string;
  bookingCode: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amount: number;
  gatewayOrderId: string;
  transactionNo: string;
  rawCallbackData?: string;
  createdAt: string;
  paidAt?: string;
};

export type GetPaymentsParams = {
  page?: number;
  size?: number;
  search?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
};

export type PaymentStatsParams = {
  paymentCode?: string;
  bookingCode?: string;
  transactionNo?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export type StatItem = {
  key: string;
  count: number;
  amount: number;
};

export type PaymentStats = {
  totalCount: number;
  paidCount: number;
  refundedCount: number;
  totalPaidAmount: number;
  totalRefundedAmount: number;
  netRevenue: number;
  avgPaidAmount: number;
  minAmount: number;
  maxAmount: number;
  refundRate: number;
  refundCount: number;
  byStatus: StatItem[];
  byMethod: StatItem[];
  bySource: StatItem[];
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueInRange: number;
};
