import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
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

export function useSyncAllFailedPasswords(limit = 20) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [syncId, setSyncId] = useState<string | null>(null);
  const handledSyncId = useRef<string | null>(null);

  const startMutation = useMutation({
    mutationFn: () => tuyaPasswordService.startSyncAllFailedPasswords(),
    onSuccess: (data) => {
      setSyncId(data.syncId);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Không thể bắt đầu đồng bộ mật khẩu Tuya';
      toast(message, 'error');
    },
  });

  const statusQuery = useQuery({
    queryKey: ['tuyaSyncAllStatus', syncId],
    queryFn: () => tuyaPasswordService.getSyncAllStatus(syncId!),
    enabled: !!syncId,
    refetchInterval: (query) =>
      query.state.data?.status === 'IN_PROGRESS' ? 5000 : false,
  });

  useEffect(() => {
    const data = statusQuery.data;
    if (!data || !syncId) return;
    if (handledSyncId.current === syncId) return;

    if (data.status === 'COMPLETED') {
      handledSyncId.current = syncId;
      if (data.total === 0) {
        toast('Không có mật khẩu nào cần đồng bộ lại', 'info');
      } else {
        toast(
          `Đã xử lý ${data.total} mật khẩu: ${data.synced} thành công, ${data.failed} thất bại`,
          data.failed === 0 ? 'success' : 'warning',
        );
      }
      queryClient.invalidateQueries({ queryKey: tuyaPasswordKeys.overview(limit) });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setSyncId(null);
    } else if (data.status === 'FAILED') {
      handledSyncId.current = syncId;
      toast(data.error || 'Đồng bộ thất bại', 'error');
      setSyncId(null);
    }
  }, [statusQuery.data?.status, syncId]);

  return {
    start: startMutation.mutate,
    isStarting: startMutation.isPending,
    syncId,
    status: statusQuery.data,
    isPolling: !!syncId && statusQuery.data?.status === 'IN_PROGRESS',
  };
}
