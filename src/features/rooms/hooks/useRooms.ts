import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { roomService } from '@/shared/services/room.service';
import { roomKeys } from './queryKeys';
import type { GetRoomsParams } from '@/shared/types';

/**
 * Fetch paginated & filtered room list.
 * Uses `keepPreviousData` so pagination transitions are seamless.
 */
export function useRooms(params: GetRoomsParams = {}) {
  return useQuery({
    queryKey: roomKeys.list(params as Record<string, unknown>),
    queryFn: () => roomService.getRooms(params),
    placeholderData: keepPreviousData,
  });
}
