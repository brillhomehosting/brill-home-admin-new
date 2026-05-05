import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
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
 * Fetch time-slot availability for a room across multiple consecutive days.
 */
export function useMultiDayAvailability(
  roomId: string | undefined,
  startDate: string | undefined,
  numDays: number = 3
) {
  const dates = Array.from({ length: numDays }, (_, i) => {
    if (!startDate) return '';
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  }).filter(Boolean);

  return useQueries({
    queries: dates.map(date => ({
      queryKey: timeSlotKeys.availability(roomId!, date),
      queryFn: () => bookingService.getBookingAvailability(roomId!, date, date),
      enabled: !!roomId && !!date,
      staleTime: 30_000,
    })),
  });
}

/**
 * Create a booking (book a time slot).
 */
export function useCreateBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingData) => bookingService.createBooking(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timeSlotAvailability'] });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['timeSlotAvailability'] });
    },
  });
}

/**
 * Delete a booking (unbook a time slot).
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
