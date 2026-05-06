import api from './api';
import { API } from '@/shared/constants';
import type { PagedApiResponse, Payment, GetPaymentsParams, PaymentStatsParams, PaymentStats, ApiResponse } from '@/shared/types';

/** GET /admin/payments */
export async function getPayments(params: GetPaymentsParams) {
  const { data } = await api.get<PagedApiResponse<Payment>>(
    API.PAYMENTS.ADMIN_LIST,
    { params }
  );
  return data.data;
}

/** GET /admin/payments/stats */
export async function getPaymentStats(params: PaymentStatsParams = {}) {
  const { data } = await api.get<ApiResponse<PaymentStats>>(
    API.PAYMENTS.STATS,
    { params }
  );
  return data.data;
}

export const paymentService = {
  getPayments,
  getPaymentStats,
};
