import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/shared/services/booking.service';
import { bookingKeys } from './queryKeys';
import { useToast } from '@/shared/components/feedback/Toast';
import type { ConfirmPaymentData, AdminCreateBookingData, AdminBookingUpdateData, CancelBookingData } from '@/shared/types';

/**
 * Hook for booking-related mutations (cancel, update status, etc.)
 */
export function useBookingMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: CancelBookingData }) =>
      bookingService.cancelBooking(bookingId, data),
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
    mutationFn: ({ bookingId, email }: { bookingId: string; email: string }) =>
      bookingService.resendConfirmation(bookingId, email),
    onSuccess: () => {
      toast('Gửi lại email thành công', 'success');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại email';
      toast(message, 'error');
    },
  });

  const resendCancellationMutation = useMutation({
    mutationFn: ({ bookingId, email }: { bookingId: string; email?: string }) =>
      bookingService.resendCancellation(bookingId, email),
    onSuccess: () => {
      toast('Gửi lại email hủy thành công', 'success');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại email hủy';
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
      toast('Cập nhật trạng thái Tuya thành công', 'success');
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
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái Tuya';
      toast(message, 'error');
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: AdminBookingUpdateData & Record<string, unknown> }) =>
      bookingService.updateBooking(bookingId, data),
    onSuccess: (data, { bookingId }) => {
      toast('Cập nhật booking thành công', 'success');
      queryClient.setQueryData(bookingKeys.detail(bookingId), data);
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật booking';
      toast(message, 'error');
    },
  });

  return {
    cancelBooking: cancelMutation,
    resendConfirmation: resendMutation,
    resendCancellation: resendCancellationMutation,
    confirmPayment: confirmPaymentMutation,
    adminCreateBooking: adminCreateMutation,
    updateBooking: updateBookingMutation,
    retryTuya: syncTuyaMutation,
    syncTuyaStatus: syncStatusMutation,
  };
}
