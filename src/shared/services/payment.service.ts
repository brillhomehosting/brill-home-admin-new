import api from './api';
import { API } from '@/shared/constants';
import type { PagedApiResponse, Payment, GetPaymentsParams } from '@/shared/types';

/** GET /admin/payments */
export async function getPayments(params: GetPaymentsParams) {
  const { data } = await api.get<PagedApiResponse<Payment>>(
    API.PAYMENTS.ADMIN_LIST,
    { params }
  );
  return data.data;
}

export const paymentService = {
  getPayments,
};
