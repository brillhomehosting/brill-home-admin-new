import api from './api';
import { API } from '@/shared/constants';
import type {
  ApiResponse,
  PagedApiResponse,
  TimeSlotAvailabilityDate,
  TimeSlotAvailabilityItem,
  Booking,
  AdminBooking,
  AdminBookingDetail,
  CreateBookingData,
  GetBookingsParams,
  ConfirmPaymentData,
  AdminCreateBookingData,
  BookingAvailabilityResponse,
  BookingAvailabilitySlot,
} from '@/shared/types';

// ================================================================
// Booking & Time-Slot availability API service
// ================================================================

/**
 * GET /bookings/availability?roomId=&startDate=&endDate=
 * Returns slots for specific room and date.
 */
export async function getBookingAvailability(
  roomId?: string,
  startDate?: string,
  endDate?: string,
): Promise<BookingAvailabilitySlot[]> {
  const { data } = await api.get<ApiResponse<BookingAvailabilityResponse[]>>(
    API.BOOKINGS.GET_AVAILABILITY,
    { params: { roomId, startDate, endDate } }
  );

  if (!data.success || !data.data || data.data.length === 0) return [];

  // Find the room group and return slots for the first date group (since we usually query one date)
  const roomData = roomId ? data.data.find(r => r.roomId === roomId) : data.data[0];
  if (!roomData || !roomData.timeslots || roomData.timeslots.length === 0) return [];

  return roomData.timeslots[0].timeSlots;
}

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

/** GET /admin/bookings — admin booking list with filters */
export async function getBookings(params: GetBookingsParams = {}) {
  // Clean empty values
  const clean: Record<string, string | number | boolean> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    clean[key] = value as string | number | boolean;
  });

  const { data } = await api.get<PagedApiResponse<AdminBooking>>(
    API.BOOKINGS.LIST,
    { params: clean },
  );
  return data;
}

/** Search booking by exact code */
export async function findBookingByCode(code: string): Promise<AdminBooking | null> {
  const response = await getBookings({ search: code, size: 1 });
  return response.data.content[0] || null;
}

/** GET /admin/bookings/:id */
export async function getBookingDetail(bookingId: string) {
  const { data } = await api.get<ApiResponse<AdminBookingDetail>>(
    API.BOOKINGS.ADMIN_DETAIL(bookingId),
  );
  return data.data;
}

/** PATCH /admin/bookings/:id/cancel */
export async function cancelBooking(bookingId: string, reason: string) {
  await api.patch(API.BOOKINGS.CANCEL(bookingId), { cancellationReason: reason });
}

/** POST /admin/bookings/:id/resend-confirmation */
export async function resendConfirmation(bookingId: string) {
  await api.post(API.BOOKINGS.RESEND_CONFIRMATION(bookingId));
}

/** POST /admin/bookings/:id/payments */
export async function confirmPayment(bookingId: string, data: ConfirmPaymentData) {
  await api.post(API.BOOKINGS.CONFIRM_PAYMENT(bookingId), data);
}

/** POST /admin/bookings */
export async function adminCreateBooking(data: AdminCreateBookingData) {
  const response = await api.post(API.BOOKINGS.ADMIN_CREATE, data);
  return response.data;
}

export const bookingService = {
  getBookingAvailability,
  getTimeSlotAvailability,
  createBooking,
  deleteBooking,
  getBookings,
  findBookingByCode,
  getBookingDetail,
  cancelBooking,
  resendConfirmation,
  confirmPayment,
  adminCreateBooking,
};
