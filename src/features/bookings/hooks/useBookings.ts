import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { bookingService } from '@/shared/services/booking.service';
import { bookingKeys } from './queryKeys';
import type { GetBookingsParams } from '@/shared/types';

/**
 * Fetch paginated & filtered booking list for admin.
 * Uses `keepPreviousData` so pagination transitions are seamless.
 */
export function useBookings(params: GetBookingsParams = {}) {
  return useQuery({
    queryKey: bookingKeys.list(params as Record<string, unknown>),
    queryFn: () => bookingService.getBookings(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a single booking by its human-readable code.
 */
export function useBookingByCode(code: string | undefined) {
  return useQuery({
    queryKey: ['bookingByCode', code],
    queryFn: () => bookingService.findBookingByCode(code!),
    enabled: !!code,
    staleTime: 60_000,
  });
}
/**
 * Calculate dynamic price for a set of slots.
 */
export function useCalculatePrice(payload: {
  roomId: string;
  bookingSlots: Array<{
    date: string;
    timeSlotIds: string[];
  }>;
}) {
  const hasSlots = payload.roomId && payload.bookingSlots.some(s => s.timeSlotIds.length > 0);
  
  return useQuery({
    queryKey: ['bookings', 'calculate-price', payload],
    queryFn: () => bookingService.calculatePrice(payload),
    enabled: !!hasSlots,
    staleTime: 5000, // Short stale time as price depends on many factors
  });
}
