import type { BaseDTO } from './api';

// ================================================================
// Booking domain types
// ================================================================

export type Booking = BaseDTO & {
  roomId: string;
  timeSlotId: string;
  date: string;
  note?: string;
};

export type CreateBookingData = {
  roomId: string;
  timeSlotId: string;
  date: string;
  note?: string;
};
