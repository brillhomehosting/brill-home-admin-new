import type { BaseDTO } from './api';

// ================================================================
// Booking domain types
// ================================================================

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'SUCCESS'
  | 'COMPLETED';

export type PaymentMethod = 'VNPAY' | 'MOMO' | 'CASH' | 'BANK_TRANSFER' | 'OTHER';

export type AdminBooking = {
  bookingId: string;
  bookingCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomName: string;
  date: string;
  checkInAt: string;
  checkOutAt: string;
  finalAmount: number;
  status: BookingStatus;
  source: string;
  cccdStatus: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
};

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

export type GetBookingsParams = {
  page?: number;
  size?: number;
  status?: BookingStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  roomId?: string;
};

export type BookingSlot = {
  timeSlotId: string;
  date: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  slotOriginalPrice: number;
  slotHolidaySurcharge: number;
  slotDiscountAmount: number;
  isHolidaySlot: boolean;
};

export type BookingPayment = {
  paymentId: string;
  paymentCode: string;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  amount: number;
  transactionNo: string;
  proofImageUrls: string;
  paidAt?: string;
  note?: string;
};

export type AdminBookingDetail = AdminBooking & {
  note: string;
  nationalIdFrontUrl: string;
  nationalIdBackUrl: string;
  originalAmount: number;
  holidaySurchargeAmount: number;
  discountAmount: number;
  comboDiscountAmount: number;
  expiredAt: string;
  gatePassword?: string;
  passwordEffectiveAt?: string;
  passwordExpiredAt?: string;
  tuyaSyncStatus: string;
  roomId: string;
  slots: BookingSlot[];
  payment?: BookingPayment;
};

export type ConfirmPaymentData = {
  paymentMethod: PaymentMethod;
  amount: number;
  transactionNo?: string;
  proofImageUrls?: string[];
  note?: string;
};

export type AdminCreateBookingData = {
  roomId: string;
  date: string;
  timeSlotIds: string[];
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  nationalIdFrontUrl?: string;
  nationalIdBackUrl?: string;
  note?: string;
};

export type BookingAvailabilitySlot = {
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
    price: number;
    isOvernight: boolean;
  };
  status: 'AVAILABLE' | 'PENDING' | 'BOOKED' | string;
  bookingId: string | null;
  discountType?: string;
  discountValue?: number;
};

export type BookingAvailabilityDateGroup = {
  date: string;
  timeSlots: BookingAvailabilitySlot[];
};

export type BookingAvailabilityResponse = {
  roomId: string;
  timeslots: BookingAvailabilityDateGroup[];
};
