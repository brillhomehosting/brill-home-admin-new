import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService } from '@/shared/services/room.service';
import { roomKeys } from './queryKeys';
import type { RoomCreateRequest, RoomUpdateRequest } from '@/shared/types';

// ================================================================
// Room mutations — create, update, delete, images, amenities
// ================================================================

export function useCreateRoom() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: RoomCreateRequest) => roomService.createRoom(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      data,
    }: {
      roomId: string;
      data: RoomUpdateRequest;
    }) => roomService.updateRoom(roomId, data),
    onSuccess: (_result, { roomId }) => {
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
      qc.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomService.deleteRoom(roomId),
    onSuccess: (_result, roomId) => {
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
      qc.removeQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });
}

/** Restore a soft-deleted room (toggle isActive back to true) */
export function useRestoreRoom() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) =>
      roomService.updateRoom(roomId, { isActive: true }),
    onSuccess: (_result, roomId) => {
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
      qc.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });
}

/** Upload files → get URLs → add to room. On addRoomImages failure, delete uploaded files. */
export function useSaveNewImages() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      files,
    }: {
      roomId: string;
      files: File[];
    }) => {
      // Step 1: Upload all files in parallel
      const results = await Promise.all(
        files.map((f) => roomService.uploadFile(f, 'ROOMS')),
      );
      const urls = results.map((r) => r.url);

      // Step 2: Add uploaded URLs to the room
      try {
        await roomService.addRoomImages(roomId, urls);
      } catch (addError) {
        // Rollback: delete all uploaded files (best-effort)
        await Promise.allSettled(
          urls.map((url) => roomService.deleteUploadByUrl(url)),
        );
        throw addError;
      }

      return urls;
    },
    onSuccess: (_urls, { roomId }) => {
      qc.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });
}

/** Delete a single room image (from room + storage) */
export function useDeleteRoomImage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      imageId,
      imageUrl,
    }: {
      roomId: string;
      imageId: string;
      imageUrl: string;
    }) => {
      await roomService.deleteRoomImage(roomId, imageId);
      // Best-effort storage cleanup
      try {
        await roomService.deleteUploadByUrl(imageUrl);
      } catch {
        // non-critical
      }
    },
    onSuccess: (_r, { roomId }) => {
      qc.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });
}

/** Update the full amenity list for a room */
export function useUpdateRoomAmenities() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      amenities,
    }: {
      roomId: string;
      amenities: Array<{ amenityId: string; isHighlight: boolean }>;
    }) => roomService.updateRoomAmenities(roomId, amenities),
    onSuccess: (_r, { roomId }) => {
      qc.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });
}
