import type { BaseDTO } from './api';

export type ComboConfig = BaseDTO & {
  minSlots: number;
  percentageDiscount: number;
  flatDiscount: number;
  isActive: boolean;
};

export type ComboConfigUpdateRequest = {
  percentageDiscount: number;
  flatDiscount: number;
  isActive: boolean;
};
