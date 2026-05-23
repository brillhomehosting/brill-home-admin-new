import type { BaseDTO } from './api';

// ================================================================
// Booking domain types
// ================================================================

export type BookingStatus =
  | 'CONFIRMED'
  | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'OTHER';

export type AdminBooking = {
  bookingId: string;
  bookingCode: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
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
  appliedCampaignId?: string;
  appliedCampaignName?: string;
  appliedCampaignType?: string;
  appliedDiscountType?: string;
  appliedDiscountValue?: number;
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
  cancelledAt?: string;
  cancelledByType?: string;
  cancellationReason?: string;
  cancellationNote?: string;
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
  copyMessage?: string;
  tuyaPasswordCreated?: boolean;
};

export type TuyaSyncResponse = {
  copyMessage: string;
  tuyaPasswordCreated: boolean;
  tuyaSyncStatus: string;
  gatePassword: string;
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
  date?: string;
  timeSlotIds?: string[];
  slots?: Array<{
    date: string;
    timeSlotIds: string[];
  }>;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  nationalIdFrontUrl?: string;
  nationalIdBackUrl?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  transactionNo?: string;
  proofImageUrls?: string[];
  paymentNote?: string;
  sendConfirmationEmail?: boolean;
};

export type AdminBookingUpdateData = {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  note?: string;
  gatePassword?: string;
  nationalIdFrontUrl?: string;
  nationalIdBackUrl?: string;
};

export type CancelBookingData = {
  cancellationReason: string;
  cancellationNote?: string;
  sendCancellationEmail?: boolean;
  email?: string;
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
