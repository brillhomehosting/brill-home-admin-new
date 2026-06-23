// ================================================================
// API Endpoint constants
// All paths are relative to the Axios baseURL (VITE_API_BASE_URL)
// ================================================================

export const API = {
  // ── Auth ──
  AUTH: {
    LOGIN: '/accounts/login',
    REFRESH_TOKEN: '/accounts/refresh-token',
    LOGOUT: '/accounts/logout',
    LOGOUT_ALL: '/accounts/logout-all',
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
    LIST: '/admin/bookings',
    ADMIN_DETAIL: (bookingId: string) => `/admin/bookings/${bookingId}` as const,
    UPDATE: (bookingId: string) => `/admin/bookings/${bookingId}` as const,
    CANCEL: (bookingId: string) => `/admin/bookings/${bookingId}/cancel` as const,
    RESEND_CONFIRMATION: (bookingId: string) => `/admin/bookings/${bookingId}/resend-confirmation` as const,
    RESEND_CANCELLATION: (bookingId: string) => `/admin/bookings/${bookingId}/resend-cancellation` as const,
    CONFIRM_PAYMENT: (bookingId: string) => `/admin/bookings/${bookingId}/payments` as const,
    ADMIN_CREATE: '/admin/bookings',
    CREATE: '/bookings',
    GET_AVAILABILITY: '/bookings/availability',
    CALCULATE_PRICE: '/bookings/calculate-price',
    DELETE: (bookingId: string) => `/bookings/${bookingId}` as const,
    TUYA_SYNC_STATUS: (bookingId: string) => `/admin/bookings/${bookingId}/tuya-sync-status` as const,
    RETRY_TUYA: (bookingId: string) => `/admin/bookings/${bookingId}/retry-tuya` as const,
    EXPORT_START: '/admin/bookings/export',
    EXPORT_STATUS: (exportId: string) => `/admin/bookings/export/${exportId}/status` as const,
    EXPORT_DOWNLOAD: (exportId: string) => `/admin/bookings/export/${exportId}/download` as const,
  },

  // ── Payments ──
  PAYMENTS: {
    ADMIN_LIST: '/admin/payments',
    STATS: '/admin/payments/stats',
    GET_METHODS: '/payments/methods',
    UPDATE: (id: string) => `/admin/payments/${id}` as const,
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

  // ── Discounts ──
  DISCOUNTS: {
    LIST: '/admin/discount-campaigns',
    CREATE: '/admin/discount-campaigns',
    UPDATE: (id: string) => `/admin/discount-campaigns/${id}` as const,
    DELETE: (id: string) => `/admin/discount-campaigns/${id}` as const,
    TOGGLE_STATUS: (id: string) => `/admin/discount-campaigns/${id}/status` as const,
    APPLICABLE: '/discount-campaigns/applicable',
  },

  // ── Dashboard ──
  DASHBOARD: {
    STATS: '/admin/dashboard/stats',
    RECENT_BOOKINGS: '/admin/dashboard/recent-bookings',
    UPCOMING_BOOKINGS: '/admin/dashboard/upcoming-bookings',
    REVENUE_TREND: '/admin/dashboard/revenue-trend',
    CLEANING_SCHEDULE: '/admin/dashboard/cleaning-schedule',
    REVENUE_COMPARISON: '/admin/dashboard/revenue-comparison',
  },

  // ── Monitor ──
  MONITOR: {
    OVERVIEW: '/admin/monitor/overview',
  },

  // ── Tuya Passwords ──
  TUYA_PASSWORDS: {
    OVERVIEW: '/admin/tuya-passwords/overview',
    DEVICE_PASSWORDS: '/admin/tuya-passwords/device-passwords',
    SYNC: (bookingId: string) => `/admin/tuya-passwords/${bookingId}/sync` as const,
    SYNC_ALL_FAILED: '/admin/tuya-passwords/sync-all-failed',
    SYNC_ALL_STATUS: (syncId: string) => `/admin/tuya-passwords/sync-all-failed/${syncId}/status` as const,
  },

  // ── Uploads ──
  UPLOADS: {
    UPLOAD: '/uploads',
    UPLOAD_CREDENTIALS: '/uploads/credentials',
    DELETE_BY_URL: '/uploads/by-url',
  },
  // ── Settings & Holidays ──
  HOLIDAYS: {
    LIST: '/admin/holiday-surcharges',
    CREATE: '/admin/holiday-surcharges',
    UPDATE: (id: string) => `/admin/holiday-surcharges/${id}` as const,
    DELETE: (id: string) => `/admin/holiday-surcharges/${id}` as const,
    CHECK_DATE: '/admin/holiday-surcharges/check-date',
  },

  // ── System Configs ──
  SYSTEM_CONFIGS: {
    LIST: '/admin/system-configs',
    CREATE: '/admin/system-configs',
    UPDATE: (id: string) => `/admin/system-configs/${id}` as const,
    DELETE: (id: string) => `/admin/system-configs/${id}` as const,
  },

  // ── Combos ──
  COMBOS: {
    LIST_PUBLIC: '/combo-configs',
    LIST_ADMIN: '/admin/combo-configs',
    UPDATE: (id: string) => `/admin/combo-configs/${id}` as const,
    TOGGLE: (id: string) => `/admin/combo-configs/${id}/toggle` as const,
  },
} as const;
