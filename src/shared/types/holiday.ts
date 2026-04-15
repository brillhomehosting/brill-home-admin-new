import type { BaseDTO } from './api';

export type HolidayType = 'ANNUAL' | 'SPECIFIC_YEAR';

export type Holiday = BaseDTO & {
  name: string;
  holidayType: HolidayType;
  startDay: string; // ISO Date string: "2026-04-14"
  endDay: string;   // ISO Date string: "2026-04-14"
  isSystemDefault: boolean;
};

export type GetHolidaysParams = {
  page?: number;
  size?: number;
  name?: string;
  holidayType?: HolidayType;
  isDeleted?: boolean;
};
