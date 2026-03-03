import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
} from '@/shared/services/time-slot.service';
import { roomKeys } from './queryKeys';
import type { CreateTimeSlotData, UpdateTimeSlotData } from '@/shared/types';

// ================================================================
// React-Query hooks for time-slot CRUD (management, not booking)
// ================================================================

/** Fetch all time slots for a room */
export function useTimeSlots(roomId?: string) {
  return useQuery({
    queryKey: roomKeys.timeSlots(roomId!),
    queryFn: () => getTimeSlots(roomId!),
    enabled: !!roomId,
  });
}

/** Create a new time slot */
export function useCreateTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { roomId: string; data: CreateTimeSlotData }) =>
      createTimeSlot(vars.roomId, vars.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: roomKeys.timeSlots(vars.roomId) });
      // Also refresh availability cache used by the booking section
      qc.invalidateQueries({ queryKey: ['timeSlotAvailability'] });
    },
  });
}

/** Update an existing time slot */
export function useUpdateTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      roomId: string;
      timeslotId: string;
      data: UpdateTimeSlotData;
    }) => updateTimeSlot(vars.roomId, vars.timeslotId, vars.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: roomKeys.timeSlots(vars.roomId) });
      qc.invalidateQueries({ queryKey: ['timeSlotAvailability'] });
    },
  });
}

/** Delete a time slot */
export function useDeleteTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { roomId: string; timeslotId: string }) =>
      deleteTimeSlot(vars.roomId, vars.timeslotId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: roomKeys.timeSlots(vars.roomId) });
      qc.invalidateQueries({ queryKey: ['timeSlotAvailability'] });
    },
  });
}
