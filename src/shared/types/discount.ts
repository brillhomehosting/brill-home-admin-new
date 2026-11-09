import type { BaseDTO } from './api';

export type DiscountTargetType = 'WEEKDAY_SLOT' | 'ROOM_WEEK_DAY' | 'ROOM' | 'WEEK_DAY' | 'ROOM_TYPE' | 'SLOT_TYPE' | 'ALL';
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
  targetWeekDay: boolean | null;
  targetOvernightSlot: boolean | null;
  targetRoomType: string | null;
  targetRoomId: string | null;
  targetRoomName: string | null;
  // WEEKDAY_SLOT only: ISO weekdays (1 = Monday ... 7 = Sunday); no rooms means every room
  targetWeekDays?: number[] | null;
  targetRoomIds?: string[] | null;
  targetRoomNames?: string[] | null;
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
