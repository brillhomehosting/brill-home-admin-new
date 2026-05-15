import { API } from '@/shared/constants';
import type { ApiResponse, MonitorOverview } from '@/shared/types';
import api from './api';

export async function getMonitorOverview(): Promise<MonitorOverview> {
  const { data } = await api.get<ApiResponse<MonitorOverview>>(API.MONITOR.OVERVIEW);
  return data.data;
}
