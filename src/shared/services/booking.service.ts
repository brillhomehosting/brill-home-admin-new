import api from './api';
import { API } from '@/shared/constants';
import type {
  ApiResponse,
  TimeSlotAvailabilityDate,
  TimeSlotAvailabilityItem,
  Booking,
  CreateBookingData,
} from '@/shared/types';

// ================================================================
// Booking & Time-Slot availability API service
// ================================================================

/**
 * GET /rooms/:roomId/time-slots/availability?startDate=&endDate=
 * Returns flattened TimeSlotAvailabilityItem[] for a single date.
 */
export async function getTimeSlotAvailability(
  roomId: string,
  date: string,
): Promise<TimeSlotAvailabilityItem[]> {
  const { data } = await api.get<ApiResponse<TimeSlotAvailabilityDate[]>>(
    API.TIME_SLOTS.AVAILABILITY(roomId),
    { params: { startDate: date, endDate: date } },
  );

  // API returns an array of { date, timeSlots[] } — flatten to just items
  return data.data.flatMap((d) => d.timeSlots);
}

/** POST /bookings */
export async function createBooking(payload: CreateBookingData) {
  const { data } = await api.post<ApiResponse<Booking>>(
    API.BOOKINGS.CREATE,
    payload,
  );
  return data.data;
}

/** DELETE /bookings/:bookingId */
export async function deleteBooking(bookingId: string) {
  await api.delete(API.BOOKINGS.DELETE(bookingId));
}

export const bookingService = {
  getTimeSlotAvailability,
  createBooking,
  deleteBooking,
};
