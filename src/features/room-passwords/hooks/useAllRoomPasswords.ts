import { useQuery } from '@tanstack/react-query';
import { roomService } from '@/shared/services/room.service';

export const allPasswordsQueryKey = ['room-passwords-all'] as const;

/** Fetch current passwords for ALL rooms in a single request. */
export function useAllRoomPasswords() {
  return useQuery({
    queryKey: allPasswordsQueryKey,
    queryFn: () => roomService.getAllRoomPasswords(),
  });
}
