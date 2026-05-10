import { useMutation, useQueryClient } from '@tanstack/react-query';
import { comboConfigService } from '@/shared/services/combo-config.service';
import { comboConfigKeys } from './comboConfigQueryKeys';
import type { ComboConfigUpdateRequest } from '@/shared/types';

export function useUpdateComboConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ComboConfigUpdateRequest }) =>
      comboConfigService.updateComboConfig(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: comboConfigKeys.all });
    },
  });
}

export function useToggleComboConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => comboConfigService.toggleComboConfig(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: comboConfigKeys.all });
    },
  });
}
