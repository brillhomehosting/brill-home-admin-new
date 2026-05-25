import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/shared/services/booking.service';
import { api } from '@/shared/services/api';
import type { CreateBookingData, PaymentMethod } from '@/shared/types';

const ADMIN_CANCEL_REASON = 'Huỷ thủ công bởi admin';

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

const VALID_PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'BANK_TRANSFER', 'OTHER'];
const QUICK_BOOKING_CONFIG_KEY = 'DEFAULT_PAYMENT_METHOD_QUICK_BOOKING';

/**
 * Fetches the default payment method for quick bookings from the admin system config.
 * Falls back to BANK_TRANSFER if the config is missing or contains an invalid value.
 */
export function useQuickBookingPaymentMethod(): PaymentMethod {
  const { data } = useQuery({
    queryKey: ['admin-system-config', QUICK_BOOKING_CONFIG_KEY],
    queryFn: async () => {
      try {
        const res = await api.get<{ data: { configValue: string } }>(
          `/admin/system-configs/key/${QUICK_BOOKING_CONFIG_KEY}`,
        );
        return res.data.data.configValue;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const value = data as string | null | undefined;
  return VALID_PAYMENT_METHODS.includes(value as PaymentMethod)
    ? (value as PaymentMethod)
    : 'BANK_TRANSFER';
}

/**
 * Quick-book a single time slot for admin — no guest info, no confirmation email.
 */
export function useQuickAdminBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, timeSlotId, date, paymentMethod }: {
      roomId: string;
      timeSlotId: string;
      date: string;
      paymentMethod: PaymentMethod;
    }) =>
      bookingService.adminCreateBooking({
        roomId,
        slots: [{ date, timeSlotIds: [timeSlotId] }],
        paymentMethod,
        sendConfirmationEmail: false,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timeSlotAvailability'] });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['timeSlotAvailability'] });
    },
  });
}

/**
 * Cancel a booking (unbook a time slot) using the admin cancel endpoint.
 */
export function useDeleteBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) =>
      bookingService.cancelBooking(bookingId, {
        cancellationReason: ADMIN_CANCEL_REASON,
        sendCancellationEmail: false,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timeSlotAvailability'] });
    },
  });
}
