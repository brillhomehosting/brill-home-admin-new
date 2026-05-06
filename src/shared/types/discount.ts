import type { BaseDTO } from './api';

export type DiscountTargetType = 'ROOM' | 'WEEK_DAY' | 'ROOM_TYPE' | 'SLOT_TYPE' | 'ALL';
export type DiscountValueType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type DiscountStatus = 'ACTIVE' | 'INACTIVE';

export type DiscountCampaign = BaseDTO & {
  name: string;
  type: DiscountTargetType;
  discountType: DiscountValueType;
  discountValue: number;
  startDate: string;
  endDate: string;
  status: DiscountStatus;
  targetWeekDay: boolean;
  targetOvernightSlot: boolean;
  targetRoomType: string;
  targetRoomId: string;
  targetRoomName: string;
};

export type GetDiscountsParams = {
  page?: number;
  size?: number;
  name?: string;
  status?: DiscountStatus;
  type?: DiscountTargetType;
  startDate?: string;
  endDate?: string;
  isDeleted?: boolean;
};
