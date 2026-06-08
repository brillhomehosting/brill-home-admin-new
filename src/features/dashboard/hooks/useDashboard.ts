import { useMutation } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/shared/services/dashboard.service';
import { paymentService } from '@/shared/services/payment.service';
import { bookingService } from '@/shared/services/booking.service';
import type { PaymentStatsParams, PeriodRange } from '@/shared/types';

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

export function useRevenueTrend(startDate: string, endDate: string, roomId?: string, enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'revenue-trend', startDate, endDate, roomId ?? 'all'],
    queryFn: () => dashboardService.getRevenueTrend(startDate, endDate, roomId),
    enabled: enabled && !!startDate && !!endDate,
  });
}

export function useRevenueTrendByRoom(startDate: string, endDate: string, enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'revenue-trend-by-room', startDate, endDate],
    queryFn: () => dashboardService.getRevenueTrendByRoom(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
  });
}

export function useRevenueComparison() {
  return useMutation({
    mutationFn: (periods: PeriodRange[]) => dashboardService.getRevenueComparison(periods),
  });
}

export function useCleaningSchedule(date: string) {
  return useQuery({
    queryKey: ['dashboard', 'cleaning-schedule', date],
    queryFn: () => dashboardService.getCleaningSchedule(date),
    staleTime: 0,
    enabled: !!date,
  });
}
