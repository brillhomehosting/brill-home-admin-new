import type { BaseDTO } from './api';

export type HolidayType = 'ANNUAL' | 'SPECIFIC_YEAR';
export type SurchargeType = 'AMOUNT' | 'PERCENT';

export type Holiday = BaseDTO & {
  name: string;
  holidayType: HolidayType;
  startDay: string;
  endDay: string;
  isSystemDefault: boolean;
  surchargeType: SurchargeType;
  surchargeAmount: number;
  surchargePercent: number;
};

export type GetHolidaysParams = {
  page?: number;
  size?: number;
  name?: string;
  holidayType?: HolidayType;
  isDeleted?: boolean;
};
