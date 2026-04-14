import api from './api';
import { API } from '@/shared/constants';
import type { ApiResponse, DashboardStats } from '@/shared/types';

/** GET /admin/dashboard/stats */
export async function getDashboardStats() {
  const { data } = await api.get<ApiResponse<DashboardStats>>(
    API.DASHBOARD.STATS
  );
  return data.data;
}

export const dashboardService = {
  getDashboardStats,
};
