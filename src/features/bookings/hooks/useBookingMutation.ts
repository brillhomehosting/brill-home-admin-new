import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/shared/services/booking.service';
import { bookingKeys } from './queryKeys';
import { useToast } from '@/shared/components/feedback/Toast';
import type { ConfirmPaymentData, AdminCreateBookingData } from '@/shared/types';

/**
 * Hook for booking-related mutations (cancel, update status, etc.)
 */
export function useBookingMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      bookingService.cancelBooking(bookingId, reason),
    onSuccess: () => {
      toast('Hủy booking thành công', 'success');
      // Invalidate both the list and the specific detail query
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi hủy booking';
      toast(message, 'error');
    },
  });

  const resendMutation = useMutation({
    mutationFn: (bookingId: string) => bookingService.resendConfirmation(bookingId),
    onSuccess: () => {
      toast('Gửi lại email thành công', 'success');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại email';
      toast(message, 'error');
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: ({
      bookingId,
      data,
    }: {
      bookingId: string;
      data: ConfirmPaymentData;
    }) => bookingService.confirmPayment(bookingId, data),
    onSuccess: () => {
      toast('Xác nhận thanh toán thành công', 'success');
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán';
      toast(message, 'error');
    },
  });

  const adminCreateMutation = useMutation({
    mutationFn: (data: AdminCreateBookingData) =>
      bookingService.adminCreateBooking(data),
    onSuccess: () => {
      toast('Tạo booking thành công', 'success');
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Có lỗi xảy ra khi tạo booking';
      toast(message, 'error');
    },
  });

  const syncTuyaMutation = useMutation({
    mutationFn: (bookingId: string) => bookingService.retryTuya(bookingId),
    onSuccess: (data, bookingId) => {
      toast('Đồng bộ Tuya thành công', 'success');
      // Update the cache with new data
      queryClient.setQueryData(bookingKeys.detail(bookingId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          copyMessage: data.copyMessage,
          tuyaPasswordCreated: data.tuyaPasswordCreated,
          tuyaSyncStatus: data.tuyaSyncStatus,
          gatePassword: data.gatePassword,
        };
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Có lỗi xảy ra khi đồng bộ Tuya';
      toast(message, 'error');
    },
  });

  const syncStatusMutation = useMutation({
    mutationFn: ({ bookingId, tuyaSyncStatus }: { bookingId: string; tuyaSyncStatus: string }) =>
      bookingService.syncTuyaStatus(bookingId, tuyaSyncStatus),
    onSuccess: (data, { bookingId }) => {
      // Update the cache silently without toast
      queryClient.setQueryData(bookingKeys.detail(bookingId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          copyMessage: data.copyMessage,
          tuyaPasswordCreated: data.tuyaPasswordCreated,
          tuyaSyncStatus: data.tuyaSyncStatus,
          gatePassword: data.gatePassword,
        };
      });
    },
  });

  return {
    cancelBooking: cancelMutation,
    resendConfirmation: resendMutation,
    confirmPayment: confirmPaymentMutation,
    adminCreateBooking: adminCreateMutation,
    retryTuya: syncTuyaMutation,
    syncTuyaStatus: syncStatusMutation,
  };
}
