export type DashboardStats = {
  date: string;
  totalBookingsToday: number;
  confirmedBookingsToday: number;
  pendingBookingsToday: number;
  revenueToday: number;
  pendingCccdCount: number;
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
  guestName: string;
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
