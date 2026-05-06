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
