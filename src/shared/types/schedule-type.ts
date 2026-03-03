import type { BaseDTO } from './api';

// ================================================================
// Schedule Type domain types
// ================================================================

export type ScheduleType = Omit<BaseDTO, 'isDeleted'> & {
  name: string;
  description: string;
  image: File | string;
};
