export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | string;

export type Payment = {
  paymentCode: string;
  bookingCode: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  amount: number;
  gatewayOrderId: string;
  transactionNo: string;
  rawCallbackData?: string;
  createdAt: string;
  paidAt?: string;
};

export type GetPaymentsParams = {
  page?: number;
  size?: number;
  search?: string;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
};
