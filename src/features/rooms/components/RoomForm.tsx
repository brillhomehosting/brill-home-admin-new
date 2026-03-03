import { Input, Select, Textarea, Button } from '@/shared/components/ui';
import { ERoomType } from '@/shared/types/enums';
import { useRoomForm } from '../hooks/useRoomForm';
import type { Room, RoomUpdateRequest } from '@/shared/types';

// ================================================================
// RoomForm — basic info fields (used in create + edit)
// ================================================================

const ROOM_TYPE_OPTIONS = [
  { value: ERoomType.NORMAL, label: 'Thường' },
  { value: ERoomType.STANDARD, label: 'Tiêu chuẩn' },
  { value: ERoomType.VIP, label: 'VIP' },
  { value: ERoomType.PREMIUM, label: 'Cao cấp' },
];

type RoomFormProps = {
  room?: Room;
  onSubmit: (payload: RoomUpdateRequest) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function RoomForm({
  room,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Lưu',
}: RoomFormProps) {
  const { values, errors, handleChange, handleSubmit } = useRoomForm(room);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      {/* Name */}
      <Input
        label="Tên phòng *"
        placeholder="VD: Phòng Cinema"
        value={values.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        disabled={isSubmitting}
      />

      {/* Description */}
      <Textarea
        label="Mô tả"
        placeholder="Mô tả chi tiết về phòng"
        value={values.description}
        onChange={(e) => handleChange('description', e.target.value)}
        error={errors.description}
        disabled={isSubmitting}
      />

      {/* 3-column grid: capacity, beds, area */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Sức chứa"
          type="number"
          min={0}
          placeholder="0"
          value={values.capacity === '' ? '' : String(values.capacity)}
          onChange={(e) =>
            handleChange(
              'capacity',
              e.target.value === '' ? '' : Number(e.target.value),
            )
          }
          disabled={isSubmitting}
        />
        <Input
          label="Số giường"
          type="number"
          min={0}
          placeholder="0"
          value={values.numberOfBeds === '' ? '' : String(values.numberOfBeds)}
          onChange={(e) =>
            handleChange(
              'numberOfBeds',
              e.target.value === '' ? '' : Number(e.target.value),
            )
          }
          disabled={isSubmitting}
        />
        <Input
          label="Diện tích (m²)"
          type="number"
          min={0}
          placeholder="0"
          value={values.area === '' ? '' : String(values.area)}
          onChange={(e) =>
            handleChange(
              'area',
              e.target.value === '' ? '' : Number(e.target.value),
            )
          }
          disabled={isSubmitting}
        />
      </div>

      {/* Room type */}
      <Select
        label="Loại phòng"
        options={ROOM_TYPE_OPTIONS}
        value={values.roomType}
        onChange={(e) => handleChange('roomType', e.target.value as ERoomType)}
        disabled={isSubmitting}
      />

      {/* isActive toggle */}
      <label className="flex items-center gap-2 text-sm font-medium text-secondary-700">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => handleChange('isActive', e.target.checked)}
          className="h-4 w-4 rounded border-border text-accent-400 focus:ring-accent-400/20"
          disabled={isSubmitting}
        />
        Phòng đang hoạt động
      </label>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
