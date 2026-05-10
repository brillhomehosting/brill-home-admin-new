import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { systemConfigService } from '@/shared/services/system-config.service';
import { systemConfigKeys } from './systemConfigQueryKeys';
import type { GetSystemConfigsParams } from '@/shared/types';

export function useSystemConfigs(params: GetSystemConfigsParams = {}) {
  return useQuery({
    queryKey: systemConfigKeys.list(params as Record<string, unknown>),
    queryFn: () => systemConfigService.getSystemConfigs(params),
    placeholderData: keepPreviousData,
  });
}
