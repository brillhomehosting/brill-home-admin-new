import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/shared/services/dashboard.service';
import { paymentService } from '@/shared/services/payment.service';
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
