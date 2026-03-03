import api from './api';
import { API } from '@/shared/constants';
import type {
  ApiResponse,
  PagedApiResponse,
  Room,
  RoomUpdateRequest,
  RoomCreateRequest,
  RoomPasswordResponse,
  GetRoomsParams,
  UploadResponse,
} from '@/shared/types';

// ================================================================
// Room API service
// ================================================================

/** GET /rooms — paginated list with optional filters */
export async function getRooms(params: GetRoomsParams = {}) {
  // Clean empty values
  const clean: Record<string, string | number | boolean> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    clean[key] = value as string | number | boolean;
  });

  const { data } = await api.get<PagedApiResponse<Room>>(API.ROOMS.LIST, {
    params: clean,
  });
  return data;
}

/** GET /rooms/:id */
export async function getRoom(roomId: string) {
  const { data } = await api.get<ApiResponse<Room>>(API.ROOMS.DETAIL(roomId));
  return data.data;
}

/** POST /rooms */
export async function createRoom(payload: RoomCreateRequest) {
  const { data } = await api.post<ApiResponse<Room>>(API.ROOMS.CREATE, payload);
  return data.data;
}

/** PUT /rooms/:id — matches backend UpdateRoomImageDTO */
export async function updateRoom(roomId: string, payload: RoomUpdateRequest) {
  const { data } = await api.put<ApiResponse<Room>>(
    API.ROOMS.UPDATE(roomId),
    payload,
  );
  return data.data;
}

/** DELETE /rooms/:id (soft-delete) */
export async function deleteRoom(roomId: string) {
  await api.delete(API.ROOMS.DELETE(roomId));
}

// ── Room images ──

/** POST /rooms/:id/images — add image URLs */
export async function addRoomImages(roomId: string, urls: string[]) {
  await api.post(API.ROOMS.ADD_IMAGES(roomId), { urls });
}

/** DELETE /rooms/:id/images/:imageId */
export async function deleteRoomImage(roomId: string, imageId: string) {
  await api.delete(API.ROOMS.DELETE_IMAGE(roomId, imageId));
}

// ── Room amenities ──

/** PUT /rooms/:id/amenities */
export async function updateRoomAmenities(
  roomId: string,
  amenities: Array<{ amenityId: string; isHighlight: boolean }>,
) {
  await api.put(API.ROOMS.UPDATE_AMENITIES(roomId), { amenities });
}

// ── File upload (used by image manager) ──

/** POST /uploads — upload a single file. Folder is sent as a query param. */
export async function uploadFile(file: File, folder = 'ROOMS') {
  const form = new FormData();
  form.append('file', file);

  const { data } = await api.post<ApiResponse<UploadResponse>>(
    API.UPLOADS.UPLOAD,
    form,
    {
      params: { folder },
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    },
  );
  return data.data;
}

/** DELETE /uploads/by-url?url=<encoded> — remove from storage */
export async function deleteUploadByUrl(url: string) {
  await api.delete(API.UPLOADS.DELETE_BY_URL, { params: { url } });
}

// ── Room password ──

/** GET /rooms/current-password → all rooms with their current passwords */
export async function getAllRoomPasswords(): Promise<RoomPasswordResponse[]> {
  const { data } = await api.get<ApiResponse<RoomPasswordResponse[]>>(
    API.ROOMS.GET_ALL_PASSWORDS,
  );
  return data.data ?? [];
}

/** GET /rooms/:id/current-password → RoomCurrentPasswordResponseDTO */
export async function getRoomPassword(roomId: string): Promise<RoomPasswordResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<RoomPasswordResponse>>(
      API.ROOMS.GET_PASSWORD(roomId),
    );
    return data.data;
  } catch {
    return null;
  }
}

/** PUT /rooms/:id/current-password */
export async function setRoomPassword(roomId: string, currentPassword: string) {
  await api.put(API.ROOMS.SET_PASSWORD(roomId), { currentPassword });
}

export const roomService = {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  addRoomImages,
  deleteRoomImage,
  updateRoomAmenities,
  uploadFile,
  deleteUploadByUrl,
  getAllRoomPasswords,
  getRoomPassword,
  setRoomPassword,
};
