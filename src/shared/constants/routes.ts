// ================================================================
// Route path constants
// ================================================================

export const ROUTES = {
  // ── Root ──
  HOME: '/',

  // ── Auth ──
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  SIGN_OUT: '/sign-out',

  // ── Rooms ──
  ROOMS: '/apps/rooms',
  ROOM_ADD: '/apps/rooms/add',
  ROOM_EDIT: (roomId: string) => `/apps/rooms/edit/${roomId}` as const,
  ROOM_VIEW: (roomId: string) => `/apps/rooms/${roomId}` as const,

  // ── Bookings ──
  BOOKINGS: {
    LIST: '/apps/bookings',
    DETAIL: (id: string) => `/apps/bookings/${id}` as const,
    NEW: '/apps/bookings/create',
  },

  // ── Invoices ──
  INVOICES: '/apps/invoices',

  // ── Discounts ──
  DISCOUNTS: '/apps/discounts',

  // ── Settings ──
  SETTINGS: '/settings',
  HOLIDAYS: '/settings/holidays',

  // ── Amenities ──
  AMENITIES: '/apps/amenities',
  AMENITIES_LIST: '/apps/amenities/list',
  AMENITY_VIEW: (amenityId: string) => `/apps/amenities/${amenityId}` as const,
  AMENITY_NEW: '/apps/amenities/new',

  // ── Schedules ──
  SCHEDULES: '/apps/schedules',
  SCHEDULE_TYPES: '/apps/schedules/types',

  // ── Password Generator ──
  RANDOM_GENERATOR: '/apps/random-generator',

  // ── Error pages ──
  ERROR_401: '/401',
  ERROR_404: '/404',

  // ── Utility ──
  LOADING: '/loading',
} as const;
