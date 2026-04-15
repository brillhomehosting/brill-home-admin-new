import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/shared/services/dashboard.service';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getDashboardStats(),
    staleTime: 60_000, // 1 minute
  });
}
