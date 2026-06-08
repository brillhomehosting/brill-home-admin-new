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
  bookingSlotCount: number;
};

export type RevenueTrendRoomItem = {
  date: string;
  roomId: string;
  roomName: string;
  revenue: number;
  bookingCount: number;
  bookingSlotCount: number;
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

export type PeriodRange = {
  startDate: string;
  endDate: string;
  label?: string;
};

export type RevenueComparisonDailyItem = {
  date: string;
  dayIndex: number;
  revenue: number;
  bookings: number;
  bookingSlots: number;
};

export type RevenueComparisonRoomItem = {
  roomId: string;
  roomName: string;
  revenue: number;
  bookings: number;
  bookingSlots: number;
};

export type RevenueComparisonPeriodResult = {
  label: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalBookings: number;
  totalBookingSlots: number;
  byRoom: RevenueComparisonRoomItem[];
  dailyData: RevenueComparisonDailyItem[];
};

export type CleaningScheduleItem = {
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  roomName: string;
  isBooked: boolean;
  isOvernight: boolean;
  isConsecutive: boolean;
  isLastConsecutiveSlot: boolean;
};
