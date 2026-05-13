import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback/Toast';
import { tuyaPasswordService } from '@/shared/services/tuya-password.service';

export const tuyaPasswordKeys = {
  all: ['tuyaPasswords'] as const,
  overview: (limit: number) => [...tuyaPasswordKeys.all, 'overview', limit] as const,
  devicePasswords: () => [...tuyaPasswordKeys.all, 'devicePasswords'] as const,
};

export function useTuyaPasswordOverview(limit = 20) {
  return useQuery({
    queryKey: tuyaPasswordKeys.overview(limit),
    queryFn: () => tuyaPasswordService.getTuyaPasswordOverview(limit),
  });
}

export function useTuyaDevicePasswords() {
  return useQuery({
    queryKey: tuyaPasswordKeys.devicePasswords(),
    queryFn: () => tuyaPasswordService.getTuyaDevicePasswords(),
  });
}

export function useSyncTuyaPassword(limit = 20) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (bookingId: string) => tuyaPasswordService.syncTuyaPassword(bookingId),
    onSuccess: () => {
      toast('Đã đồng bộ lại mật khẩu Tuya', 'success');
      queryClient.invalidateQueries({ queryKey: tuyaPasswordKeys.overview(limit) });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Không thể đồng bộ mật khẩu Tuya';
      toast(message, 'error');
    },
  });
}
