import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/shared/services/booking.service';
import { bookingKeys } from './queryKeys';

/**
 * Fetch booking details for admin.
 */
export function useBookingDetail(bookingId?: string) {
  return useQuery({
    queryKey: bookingId ? bookingKeys.detail(bookingId) : [],
    queryFn: () => bookingService.getBookingDetail(bookingId!),
    enabled: !!bookingId,
  });
}
