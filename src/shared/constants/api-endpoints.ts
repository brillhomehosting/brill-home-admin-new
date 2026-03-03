// ================================================================
// API Endpoint constants
// All paths are relative to the Axios baseURL (VITE_API_BASE_URL)
// ================================================================

export const API = {
  // ── Auth ──
  AUTH: {
    LOGIN: '/accounts/login',
    REFRESH_TOKEN: '/accounts/refresh-token',
  },

  // ── Rooms ──
  ROOMS: {
    LIST: '/rooms',
    DETAIL: (roomId: string) => `/rooms/${roomId}` as const,
    CREATE: '/rooms',
    UPDATE: (roomId: string) => `/rooms/${roomId}` as const,
    DELETE: (roomId: string) => `/rooms/${roomId}` as const,

    // Room images
    ADD_IMAGES: (roomId: string) => `/rooms/${roomId}/images` as const,
    DELETE_IMAGE: (roomId: string, imageId: string) =>
      `/rooms/${roomId}/images/${imageId}` as const,

    // Room amenities
    UPDATE_AMENITIES: (roomId: string) =>
      `/rooms/${roomId}/amenities` as const,

    // Room password
    GET_ALL_PASSWORDS: '/rooms/current-password',
    GET_PASSWORD: (roomId: string) =>
      `/rooms/${roomId}/current-password` as const,
    SET_PASSWORD: (roomId: string) =>
      `/rooms/${roomId}/current-password` as const,
  },

  // ── Time Slots ──
  TIME_SLOTS: {
    LIST: (roomId: string) => `/rooms/${roomId}/time-slots` as const,
    DETAIL: (timeslotId: string) => `/timeslots/${timeslotId}` as const,
    CREATE: (roomId: string) => `/rooms/${roomId}/time-slots` as const,
    UPDATE: (roomId: string, timeslotId: string) =>
      `/rooms/${roomId}/time-slots/${timeslotId}` as const,
    DELETE: (roomId: string, timeslotId: string) =>
      `/rooms/${roomId}/time-slots/${timeslotId}` as const,
    AVAILABILITY: (roomId: string) =>
      `/rooms/${roomId}/time-slots/availability` as const,
  },

  // ── Bookings ──
  BOOKINGS: {
    CREATE: '/bookings',
    DELETE: (bookingId: string) => `/bookings/${bookingId}` as const,
  },

  // ── Amenities ──
  AMENITIES: {
    LIST: '/amenities',
    DETAIL: (id: string) => `/amenities/${id}` as const,
    CREATE: '/amenities',
    UPDATE: (id: string) => `/amenities/${id}` as const,
    DELETE: (id: string) => `/amenities/${id}` as const,
  },

  // ── Schedule Types ──
  SCHEDULE_TYPES: {
    LIST: '/scheduleTypes',
    CREATE: '/scheduleTypes',
    UPDATE: (id: string) => `/scheduleTypes/${id}` as const,
    DELETE: (id: string) => `/scheduleTypes/${id}` as const,
  },

  // ── Uploads ──
  UPLOADS: {
    UPLOAD: '/uploads',
    DELETE_BY_URL: '/uploads/by-url',
  },
} as const;
