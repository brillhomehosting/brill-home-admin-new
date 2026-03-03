import api from './api';
import { API } from '@/shared/constants';
import type { ApiResponse, Amenity } from '@/shared/types';

// ================================================================
// Amenity API service
// ================================================================

/** GET /amenities — full list (no pagination on this endpoint) */
export async function getAmenities(): Promise<Amenity[]> {
  const { data } = await api.get<ApiResponse<Amenity[]>>(API.AMENITIES.LIST);
  return data.data;
}

/** GET /amenities/:id */
export async function getAmenity(id: string): Promise<Amenity> {
  const { data } = await api.get<ApiResponse<Amenity>>(API.AMENITIES.DETAIL(id));
  return data.data;
}

/** POST /amenities */
export async function createAmenity(
  payload: Pick<Amenity, 'name'> & Partial<Amenity>,
): Promise<Amenity> {
  const { data } = await api.post<ApiResponse<Amenity>>(
    API.AMENITIES.CREATE,
    payload,
  );
  return data.data;
}

/** PUT /amenities/:id — full replacement */
export async function updateAmenity(
  id: string,
  payload: Partial<Amenity>,
): Promise<Amenity> {
  const { data } = await api.put<ApiResponse<Amenity>>(
    API.AMENITIES.UPDATE(id),
    payload,
  );
  return data.data;
}

/** DELETE /amenities/:id */
export async function deleteAmenity(id: string): Promise<void> {
  await api.delete(API.AMENITIES.DELETE(id));
}

export const amenityService = {
  getAmenities,
  getAmenity,
  createAmenity,
  updateAmenity,
  deleteAmenity,
};
