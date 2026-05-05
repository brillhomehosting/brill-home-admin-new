import type { BaseDTO } from './api';
import type { ERoomType } from './enums';

// ================================================================
// Room domain types
// ================================================================

export type RoomImage = BaseDTO & {
  url: string;
};

export type RoomAmenity = BaseDTO & {
  name: string;
  icon?: string;
  description?: string;
  isHighlight?: boolean;
};

export type Room = BaseDTO & {
  name: string;
  description?: string;
  capacity?: number;
  numberOfBeds?: number;
  area?: number;
  images?: RoomImage[];
  isActive?: boolean;
  amenities?: RoomAmenity[];
  hourlyRate?: number;
  overnightRate?: number;
  roomType?: ERoomType;
};

/**
 * Request body for PUT /rooms/:id.
 * Matches backend UpdateRoomImageDTO.
 */
export type RoomUpdateRequest = {
  name?: string;
  description?: string;
  capacity?: number;
  numberOfBeds?: number;
  area?: number;
  isActive?: boolean;
  roomType?: ERoomType;
};

/**
 * Request body for POST /rooms.
 * Matches backend RoomCreateRequestDTO.
 */
export type RoomCreateRequest = {
  name: string;
  description?: string;
  capacity?: number;
  numberOfBeds?: number;
  area?: number;
  images?: Array<{ url: string }>;
  isActive?: boolean;
  roomType?: ERoomType;
  amenityIds?: string[];
};

/**
 * Response from GET /rooms/:id/current-password.
 * Matches backend RoomCurrentPasswordResponseDTO.
 */
export type RoomPasswordResponse = {
  id: string;
  name: string;
  currentPassword: string | null;
};

/**
 * Query params for GET /rooms.
 * Matches backend RoomFilterDTO + pagination.
 */
export type GetRoomsParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  name?: string;
  isActive?: boolean;
  startCreatedAt?: string;
  endCreatedAt?: string;
  isDeleted?: boolean;
};

/**
 * Represents a local image pending upload (used in forms).
 */
export type LocalImage = {
  id?: string;
  url: string;
  isLocal: boolean;
  file?: File;
};
