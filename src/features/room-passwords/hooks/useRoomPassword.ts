import { useQuery } from '@tanstack/react-query';
import { roomService } from '@/shared/services/room.service';

export const passwordKeys = {
  all: ['room-password'] as const,
  room: (roomId: string) => [...passwordKeys.all, roomId] as const,
};

/** Fetch current password for a single room. Returns null if none set. */
export function useRoomPassword(roomId: string) {
  return useQuery({
    queryKey: passwordKeys.room(roomId),
    queryFn: () => roomService.getRoomPassword(roomId),
    enabled: !!roomId,
  });
}
