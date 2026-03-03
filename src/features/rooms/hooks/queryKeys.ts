// ================================================================
// Centralised query keys for the Rooms feature
// ================================================================

export const roomKeys = {
  all: ['rooms'] as const,

  lists: () => [...roomKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) =>
    [...roomKeys.lists(), params] as const,

  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (roomId: string) => [...roomKeys.details(), roomId] as const,

  // Time-slot management (CRUD)
  timeSlots: (roomId: string) =>
    [...roomKeys.detail(roomId), 'timeSlots'] as const,
};
