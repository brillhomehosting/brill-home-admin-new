import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/shared/services/payment.service';
import type { GetPaymentsParams } from '@/shared/types';

export function usePayments(params: GetPaymentsParams) {
  return useQuery({
    queryKey: ['adminPayments', params],
    queryFn: () => paymentService.getPayments(params),
    placeholderData: (previousData) => previousData,
  });
}
