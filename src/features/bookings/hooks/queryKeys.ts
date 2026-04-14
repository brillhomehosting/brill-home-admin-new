// ================================================================
// Centralised query keys for the Bookings feature
// ================================================================

export const bookingKeys = {
  all: ['bookings'] as const,

  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) =>
    [...bookingKeys.lists(), params] as const,

  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (bookingId: string) => [...bookingKeys.details(), bookingId] as const,

  availability: (roomId: string, params?: Record<string, unknown>) =>
    ['rooms', roomId, 'availability', params] as const,
};
