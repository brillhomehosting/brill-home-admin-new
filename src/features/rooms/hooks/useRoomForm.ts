import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { Room, RoomUpdateRequest } from '@/shared/types';
import { ERoomType } from '@/shared/types/enums';

// ================================================================
// Form state hook — extracted from RoomForm for testability
// ================================================================

export type RoomFormValues = {
  name: string;
  description: string;
  capacity: number | '';
  numberOfBeds: number | '';
  area: number | '';
  roomType: ERoomType;
  isActive: boolean;
};

export type RoomFieldErrors = Partial<Record<keyof RoomFormValues, string>>;

const INITIAL: RoomFormValues = {
  name: '',
  description: '',
  capacity: '',
  numberOfBeds: '',
  area: '',
  roomType: ERoomType.NORMAL,
  isActive: true,
};

function fromRoom(room: Room): RoomFormValues {
  return {
    name: room.name ?? '',
    description: room.description ?? '',
    capacity: room.capacity ?? '',
    numberOfBeds: room.numberOfBeds ?? '',
    area: room.area ?? '',
    roomType: room.roomType ?? ERoomType.NORMAL,
    isActive: room.isActive ?? true,
  };
}

/**
 * Convert form values to the backend UpdateRoomImageDTO shape.
 * hourlyRate / overnightRate are read-only (computed from TimeSlots)
 * and NOT part of the room update request.
 */
export function toPayload(values: RoomFormValues): RoomUpdateRequest {
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    capacity: values.capacity === '' ? undefined : Number(values.capacity),
    numberOfBeds:
      values.numberOfBeds === '' ? undefined : Number(values.numberOfBeds),
    area: values.area === '' ? undefined : Number(values.area),
    roomType: values.roomType,
    isActive: values.isActive,
  };
}

export function useRoomForm(room?: Room) {
  const [values, setValues] = useState<RoomFormValues>(
    room ? fromRoom(room) : INITIAL,
  );
  const [errors, setErrors] = useState<RoomFieldErrors>({});

  // Sync with external room data (edit mode)
  useEffect(() => {
    if (room) setValues(fromRoom(room));
  }, [room]);

  const handleChange = useCallback(
    <K extends keyof RoomFormValues>(field: K, value: RoomFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const validate = useCallback((): boolean => {
    const next: RoomFieldErrors = {};
    if (!values.name.trim()) next.name = 'Vui lòng nhập tên phòng';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [values]);

  const handleSubmit = useCallback(
    (onSubmit: (payload: RoomUpdateRequest) => void) => (e: FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      onSubmit(toPayload(values));
    },
    [values, validate],
  );

  return { values, errors, handleChange, handleSubmit, setValues };
}
