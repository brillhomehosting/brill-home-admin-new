import api from './api';
import { API } from '@/shared/constants';
import type { PagedApiResponse, Payment, GetPaymentsParams, PaymentStatsParams, PaymentStats, ApiResponse, PaymentUpdateData, BookingPayment } from '@/shared/types';

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

/** PATCH /admin/payments/:id */
export async function updatePayment(paymentId: string, data: PaymentUpdateData) {
  const { data: res } = await api.patch<ApiResponse<BookingPayment>>(
    API.PAYMENTS.UPDATE(paymentId),
    data
  );
  return res.data;
}

export const paymentService = {
  getPayments,
  getPaymentStats,
  updatePayment,
};
