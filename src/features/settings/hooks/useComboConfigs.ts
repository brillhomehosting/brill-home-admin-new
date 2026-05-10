import { useQuery } from '@tanstack/react-query';
import { comboConfigService } from '@/shared/services/combo-config.service';
import { comboConfigKeys } from './comboConfigQueryKeys';

export function useComboConfigs() {
  return useQuery({
    queryKey: comboConfigKeys.lists(),
    queryFn: () => comboConfigService.getComboConfigs(),
  });
}
