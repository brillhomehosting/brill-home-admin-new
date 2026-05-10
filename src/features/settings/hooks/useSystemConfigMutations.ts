import { useMutation, useQueryClient } from '@tanstack/react-query';
import { systemConfigService } from '@/shared/services/system-config.service';
import { systemConfigKeys } from './systemConfigQueryKeys';
import type {
  SystemConfigCreateRequest,
  SystemConfigUpdateRequest,
} from '@/shared/types';

export function useCreateSystemConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SystemConfigCreateRequest) =>
      systemConfigService.createSystemConfig(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: systemConfigKeys.all });
    },
  });
}

export function useUpdateSystemConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: SystemConfigUpdateRequest;
    }) => systemConfigService.updateSystemConfig(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: systemConfigKeys.all });
    },
  });
}

export function useDeleteSystemConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => systemConfigService.deleteSystemConfig(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: systemConfigKeys.all });
    },
  });
}
