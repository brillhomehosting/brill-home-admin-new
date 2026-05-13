import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/shared/services/dashboard.service';
import { paymentService } from '@/shared/services/payment.service';
import { bookingService } from '@/shared/services/booking.service';
import type { PaymentStatsParams } from '@/shared/types';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getDashboardStats,
  });
}

export function useRecentBookings() {
  return useQuery({
    queryKey: ['dashboard', 'recent-bookings'],
    queryFn: dashboardService.getRecentBookings,
  });
}

export function useUpcomingBookings() {
  return useQuery({
    queryKey: ['dashboard', 'upcoming-bookings'],
    queryFn: dashboardService.getUpcomingBookings,
  });
}

export function usePaymentStats(params: PaymentStatsParams = {}) {
  return useQuery({
    queryKey: ['dashboard', 'payment-stats', params],
    queryFn: () => paymentService.getPaymentStats(params),
  });
}

export function useRoomTrackers() {
  return useQuery({
    queryKey: ['dashboard', 'room-trackers'],
    queryFn: dashboardService.getRoomTrackers,
    refetchInterval: 10 * 60 * 1000, // auto-refresh every 10 mins
  });
}

export function useAllRoomsAvailability(date: string) {
  return useQuery({
    queryKey: ['dashboard', 'availability', date],
    queryFn: () => bookingService.getRoomsAvailability(date, date),
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useRevenueTrend(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['dashboard', 'revenue-trend', startDate, endDate],
    queryFn: () => dashboardService.getRevenueTrend(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}
