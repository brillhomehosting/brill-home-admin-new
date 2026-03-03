import { useQuery } from '@tanstack/react-query';
import { roomService } from '@/shared/services/room.service';
import { roomKeys } from './queryKeys';

/**
 * Fetch a single room by ID.
 * Enabled only when `roomId` is truthy.
 */
export function useRoomDetail(roomId: string | undefined) {
  return useQuery({
    queryKey: roomKeys.detail(roomId!),
    queryFn: () => roomService.getRoom(roomId!),
    enabled: !!roomId,
  });
}
