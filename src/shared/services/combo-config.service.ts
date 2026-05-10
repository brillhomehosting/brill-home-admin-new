import api from './api';
import { API } from '@/shared/constants';
import type { ApiResponse, ComboConfig, ComboConfigUpdateRequest } from '@/shared/types';

export async function getComboConfigs(): Promise<ComboConfig[]> {
  const { data } = await api.get<ApiResponse<ComboConfig[]>>(API.COMBOS.LIST_ADMIN);
  return data.data;
}

export async function updateComboConfig(
  id: string,
  payload: ComboConfigUpdateRequest,
): Promise<ComboConfig> {
  const { data } = await api.put<ApiResponse<ComboConfig>>(API.COMBOS.UPDATE(id), payload);
  return data.data;
}

export async function toggleComboConfig(id: string): Promise<ComboConfig> {
  const { data } = await api.patch<ApiResponse<ComboConfig>>(API.COMBOS.TOGGLE(id));
  return data.data;
}

export const comboConfigService = {
  getComboConfigs,
  updateComboConfig,
  toggleComboConfig,
};
