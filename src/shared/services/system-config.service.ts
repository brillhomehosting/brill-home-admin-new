import api from './api';
import { API } from '@/shared/constants';
import type {
  ApiResponse,
  PagedApiResponse,
  SystemConfig,
  SystemConfigCreateRequest,
  SystemConfigUpdateRequest,
  GetSystemConfigsParams,
} from '@/shared/types';

export async function getSystemConfigs(
  params: GetSystemConfigsParams = {},
): Promise<PagedApiResponse<SystemConfig>['data']> {
  const clean: Record<string, unknown> = {};
  if (params.page !== undefined) clean.page = params.page;
  if (params.size !== undefined) clean.size = params.size;
  if (params.configKey) clean.configKey = params.configKey;

  const { data } = await api.get<PagedApiResponse<SystemConfig>>(
    API.SYSTEM_CONFIGS.LIST,
    { params: clean },
  );
  return data.data;
}

export async function createSystemConfig(
  payload: SystemConfigCreateRequest,
): Promise<SystemConfig> {
  const { data } = await api.post<ApiResponse<SystemConfig>>(
    API.SYSTEM_CONFIGS.CREATE,
    payload,
  );
  return data.data;
}

export async function updateSystemConfig(
  id: string,
  payload: SystemConfigUpdateRequest,
): Promise<SystemConfig> {
  const { data } = await api.put<ApiResponse<SystemConfig>>(
    API.SYSTEM_CONFIGS.UPDATE(id),
    payload,
  );
  return data.data;
}

export async function deleteSystemConfig(id: string): Promise<void> {
  await api.delete(API.SYSTEM_CONFIGS.DELETE(id));
}

export const systemConfigService = {
  getSystemConfigs,
  createSystemConfig,
  updateSystemConfig,
  deleteSystemConfig,
};
