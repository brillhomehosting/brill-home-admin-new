import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/shared/services/booking.service';
import type { CreateBookingData } from '@/shared/types';

// ── Query keys ──
export const timeSlotKeys = {
  availability: (roomId: string, date: string) =>
    ['timeSlotAvailability', roomId, date] as const,
};

/**
 * Fetch time-slot availability for a room on a specific date.
 */
export function useTimeSlotAvailability(
  roomId: string | undefined,
  date: string | undefined,
) {
  return useQuery({
    queryKey: timeSlotKeys.availability(roomId!, date!),
    queryFn: () => bookingService.getBookingAvailability(roomId!, date!, date!),
    enabled: !!roomId && !!date,
    staleTime: 30_000,
  });
}

/**
 * Create a booking (book a time slot).
 * Invalidates availability cache on success.
 */
export function useCreateBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingData) => bookingService.createBooking(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timeSlotAvailability'] });
    },
    onError: () => {
      // Also refetch on error to keep UI in sync
      qc.invalidateQueries({ queryKey: ['timeSlotAvailability'] });
    },
  });
}

/**
 * Delete a booking (unbook a time slot).
 * Invalidates availability cache on success.
 */
export function useDeleteBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingService.deleteBooking(bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timeSlotAvailability'] });
    },
  });
}
