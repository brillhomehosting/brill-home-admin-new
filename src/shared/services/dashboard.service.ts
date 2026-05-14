import api from './api';
import { API } from '@/shared/constants';
import type { ApiResponse, DashboardStats, DashboardBooking, RevenueTrendItem, RevenueTrendRoomItem, RoomTracker } from '@/shared/types';

/** GET /admin/dashboard/stats */
export async function getDashboardStats() {
  const { data } = await api.get<ApiResponse<DashboardStats>>(
    API.DASHBOARD.STATS
  );
  return data.data;
}

/** GET /admin/dashboard/recent-bookings */
export async function getRecentBookings() {
  const { data } = await api.get<ApiResponse<DashboardBooking[]>>(
    API.DASHBOARD.RECENT_BOOKINGS
  );
  return data.data;
}

/** GET /admin/dashboard/upcoming-bookings */
export async function getUpcomingBookings() {
  const { data } = await api.get<ApiResponse<DashboardBooking[]>>(
    API.DASHBOARD.UPCOMING_BOOKINGS
  );
  return data.data;
}

/** GET /admin/rooms/tracker */
export async function getRoomTrackers() {
  const { data } = await api.get<ApiResponse<RoomTracker[]>>('/admin/rooms/tracker');
  return data.data;
}

/** GET /admin/dashboard/revenue-trend */
export async function getRevenueTrend(startDate: string, endDate: string, roomId?: string) {
  const { data } = await api.get<ApiResponse<RevenueTrendItem[]>>(
    API.DASHBOARD.REVENUE_TREND,
    { params: { startDate, endDate, roomId } }
  );
  return data.data;
}

/** GET /admin/dashboard/revenue-trend/by-room */
export async function getRevenueTrendByRoom(startDate: string, endDate: string) {
  const { data } = await api.get<ApiResponse<RevenueTrendRoomItem[]>>(
    `${API.DASHBOARD.REVENUE_TREND}/by-room`,
    { params: { startDate, endDate } }
  );
  return data.data;
}

export const dashboardService = {
  getDashboardStats,
  getRecentBookings,
  getUpcomingBookings,
  getRoomTrackers,
  getRevenueTrend,
  getRevenueTrendByRoom,
};
