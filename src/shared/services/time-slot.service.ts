import api from './api';
import { API } from '@/shared/constants';
import type {
  ApiResponse,
  TimeSlot,
  CreateTimeSlotData,
  UpdateTimeSlotData,
} from '@/shared/types';

// ================================================================
// Time Slot CRUD API service
// ================================================================

/** GET /rooms/:roomId/time-slots */
export async function getTimeSlots(roomId: string): Promise<TimeSlot[]> {
  const { data } = await api.get<ApiResponse<TimeSlot[]>>(
    API.TIME_SLOTS.LIST(roomId),
  );
  return data.data;
}

/** POST /rooms/:roomId/time-slots */
export async function createTimeSlot(
  roomId: string,
  payload: CreateTimeSlotData,
): Promise<TimeSlot> {
  const { data } = await api.post<ApiResponse<TimeSlot>>(
    API.TIME_SLOTS.CREATE(roomId),
    { ...payload, roomId, status: 'AVAILABLE' },
  );
  return data.data;
}

/** PUT /rooms/:roomId/time-slots/:timeslotId */
export async function updateTimeSlot(
  roomId: string,
  timeslotId: string,
  payload: UpdateTimeSlotData,
): Promise<TimeSlot> {
  const { data } = await api.put<ApiResponse<TimeSlot>>(
    API.TIME_SLOTS.UPDATE(roomId, timeslotId),
    { ...payload, roomId, status: 'AVAILABLE' },
  );
  return data.data;
}

/** DELETE /rooms/:roomId/time-slots/:timeslotId */
export async function deleteTimeSlot(
  roomId: string,
  timeslotId: string,
): Promise<void> {
  await api.delete(API.TIME_SLOTS.DELETE(roomId, timeslotId));
}

export const timeSlotService = {
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
};
