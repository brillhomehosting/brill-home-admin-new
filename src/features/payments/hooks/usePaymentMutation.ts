import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/shared/services/payment.service';
import { useToast } from '@/shared/components/feedback/Toast';
import { bookingKeys } from '@/features/bookings/hooks/queryKeys';
import type { PaymentUpdateData } from '@/shared/types';

export function usePaymentMutation() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: PaymentUpdateData }) =>
      paymentService.updatePayment(paymentId, data),
    onSuccess: () => {
      toast('Cập nhật thanh toán thành công', 'success');
      qc.invalidateQueries({ queryKey: ['adminPayments'] });
      qc.invalidateQueries({ queryKey: bookingKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thanh toán';
      toast(message, 'error');
    },
  });

  return { updatePayment: updateMutation };
}
