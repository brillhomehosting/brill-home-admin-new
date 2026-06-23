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
  AdminBookingUpdateData,
  CancelBookingData,
  BookingAvailabilityResponse,
  BookingAvailabilitySlot,
  TuyaSyncResponse,
  BookingExportStartResult,
  BookingExportStatusResult,
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
 * GET /bookings/availability?startDate=&endDate=
 * Returns availability groups for ALL rooms.
 */
export async function getRoomsAvailability(
  startDate?: string,
  endDate?: string,
): Promise<BookingAvailabilityResponse[]> {
  const { data } = await api.get<ApiResponse<BookingAvailabilityResponse[]>>(
    API.BOOKINGS.GET_AVAILABILITY,
    { params: { startDate, endDate } }
  );
  return data.data || [];
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
export async function cancelBooking(bookingId: string, payload: CancelBookingData) {
  await api.patch(API.BOOKINGS.CANCEL(bookingId), payload);
}

/** POST /admin/bookings/:id/resend-confirmation */
export async function resendConfirmation(bookingId: string, email: string) {
  await api.post(API.BOOKINGS.RESEND_CONFIRMATION(bookingId), { email });
}

/** POST /admin/bookings/:id/resend-cancellation */
export async function resendCancellation(bookingId: string, email?: string) {
  await api.post(API.BOOKINGS.RESEND_CANCELLATION(bookingId), { email });
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

/** PATCH /admin/bookings/:id */
export async function updateBooking(
  bookingId: string,
  payload: AdminBookingUpdateData & Record<string, unknown>,
): Promise<AdminBookingDetail> {
  const { data } = await api.patch<ApiResponse<AdminBookingDetail>>(
    API.BOOKINGS.UPDATE(bookingId),
    payload,
  );
  return data.data;
}

/** PATCH /admin/bookings/:id/tuya-sync-status */
export async function syncTuyaStatus(bookingId: string, tuyaSyncStatus: string): Promise<TuyaSyncResponse> {
  const { data } = await api.patch<ApiResponse<TuyaSyncResponse>>(
    API.BOOKINGS.TUYA_SYNC_STATUS(bookingId),
    { tuyaSyncStatus },
  );
  return data.data;
}

/** POST /admin/bookings/:id/retry-tuya */
export async function retryTuya(bookingId: string): Promise<TuyaSyncResponse> {
  const { data } = await api.post<ApiResponse<TuyaSyncResponse>>(
    API.BOOKINGS.RETRY_TUYA(bookingId),
  );
  return data.data;
}

/** POST /bookings/calculate-price */
export async function calculatePrice(payload: {
  roomId: string;
  bookingSlots: Array<{
    date: string;
    timeSlotIds: string[];
  }>;
}) {
  const { data } = await api.post<ApiResponse<any>>(
    API.BOOKINGS.CALCULATE_PRICE,
    payload
  );
  return data.data;
}

/** POST /admin/bookings/export — start async export job */
export async function startExport(
  params: Omit<GetBookingsParams, 'page' | 'size'>,
  includeSummary = true,
  includePaymentColumn = true,
) {
  const clean: Record<string, any> = { includeSummary, includePaymentColumn };
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      clean[key === 'status' ? 'statuses' : key] = String(value);
    }
  });
  const { data } = await api.post<ApiResponse<BookingExportStartResult>>(
    API.BOOKINGS.EXPORT_START,
    null,
    { params: clean },
  );
  return data.data;
}

/** GET /admin/bookings/export/:exportId/download — download the generated Excel blob */
export async function downloadExport(exportId: string, filename: string) {
  const response = await api.get(API.BOOKINGS.EXPORT_DOWNLOAD(exportId), {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** GET /admin/bookings/export/:exportId/status — poll export job status */
export async function getExportStatus(exportId: string) {
  const { data } = await api.get<ApiResponse<BookingExportStatusResult>>(
    API.BOOKINGS.EXPORT_STATUS(exportId),
  );
  return data.data;
}

export const bookingService = {
  getBookingAvailability,
  getRoomsAvailability,
  getTimeSlotAvailability,
  createBooking,
  deleteBooking,
  getBookings,
  findBookingByCode,
  getBookingDetail,
  cancelBooking,
  resendConfirmation,
  resendCancellation,
  confirmPayment,
  adminCreateBooking,
  updateBooking,
  syncTuyaStatus,
  retryTuya,
  calculatePrice,
  startExport,
  getExportStatus,
  downloadExport,
};
