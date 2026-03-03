import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService } from '@/shared/services/room.service';
import { passwordKeys } from './useRoomPassword';
import { allPasswordsQueryKey } from './useAllRoomPasswords';

/** Set / replace the password for a room. */
export function useSetRoomPassword() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      password,
    }: {
      roomId: string;
      password: string;
    }) => roomService.setRoomPassword(roomId, password),
    onSuccess: (_r, { roomId }) => {
      qc.invalidateQueries({ queryKey: passwordKeys.room(roomId) });
      qc.invalidateQueries({ queryKey: allPasswordsQueryKey });
    },
  });
}
