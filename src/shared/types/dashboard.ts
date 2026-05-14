export type DashboardStats = {
  confirmedBookingsToday: number;
  revenueToday: number;
  occupiedRooms: number;
  vacantRooms: number;
  revenueLastMonth: number;
};

export type RevenueTrendItem = {
  date: string;
  revenue: number;
  bookingCount: number;
};

export type RevenueTrendRoomItem = {
  date: string;
  roomId: string;
  roomName: string;
  revenue: number;
  bookingCount: number;
};

export type DashboardBooking = {
  bookingId: string;
  bookingCode: string;
  guestName: string;
  guestPhone: string;
  roomId: string;
  roomName: string;
  roomType: 'NORMAL' | 'VIP'; // Based on common patterns in the app
  checkInAt: string;
  checkOutAt: string;
  status: string;
  finalAmount: number;
  createdAt: string;
};
export type RoomTrackerBooking = {
  bookingId: string;
  bookingCode: string;
  guestName: string | null;
  guestPhone?: string;
  checkInAt: string;
  checkOutAt: string;
  minutesUntilCheckout?: number;
};

export type RoomTracker = {
  roomId: string;
  roomName: string;
  roomType: string;
  status: string;
  currentBooking: RoomTrackerBooking | null;
  nextBooking: RoomTrackerBooking | null;
};
