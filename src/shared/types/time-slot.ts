import type { BaseDTO } from './api';

// ================================================================
// Time Slot domain types
// ================================================================

export type TimeSlot = BaseDTO & {
  roomId?: string;
  startTime?: string;
  endTime?: string;
  price?: number;
  isOvernight?: boolean;
  status?: string;
};

export type TimeSlotAvailabilityItem = {
  timeSlot: TimeSlot;
  isActive: boolean;
  bookingId?: string;
};

export type TimeSlotAvailabilityDate = {
  date: string;
  timeSlots: TimeSlotAvailabilityItem[];
};

// ── CRUD payloads ──

export type CreateTimeSlotData = {
  startTime: string;
  endTime: string;
  price: number;
  isOvernight: boolean;
  status?: string;
};

export type UpdateTimeSlotData = Partial<CreateTimeSlotData>;
