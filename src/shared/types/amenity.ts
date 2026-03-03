import type { BaseDTO } from './api';

// ================================================================
// Amenity domain types
// ================================================================

export type Amenity = BaseDTO & {
  name: string;
  icon?: string;
  description?: string;
};
