import { useEffect } from 'react';
import { Modal, Button, Input, Textarea, DynamicIcon } from '@/shared/components/ui';
import { useAmenityForm } from '../hooks/useAmenityForm';
import type { Amenity } from '@/shared/types';

type AmenityFormModalProps = {
  /** open=true shows the modal. */
  open: boolean;
  /** Called when modal should close (cancel / backdrop / escape). */
  onClose: () => void;
  /** Called with the sanitized payload when user clicks Save/Create. */
  onSubmit: (payload: Partial<Amenity>) => void;
  /** Existing amenity for edit mode; undefined = create mode. */
  amenity?: Amenity;
  /** Disable interactions during mutation. */
  isSubmitting?: boolean;
};

export function AmenityFormModal({
  open,
  onClose,
  onSubmit,
  amenity,
  isSubmitting = false,
}: AmenityFormModalProps) {
  const { form, errors, handleChange, validate, isDirty, reset } =
    useAmenityForm(amenity);

  // Reset form when the modal opens or the amenity changes
  useEffect(() => {
    if (open) reset(amenity);
  }, [open, amenity, reset]);

  const isEditMode = Boolean(amenity);

  const handleSave = () => {
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      icon: form.icon.trim() || undefined,
      description: form.description.trim() || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa tiện nghi' : 'Thêm tiện nghi mới'}
      size="md"
      closeOnOverlayClick={!isSubmitting}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isSubmitting}
            disabled={!isDirty && isEditMode}
          >
            {isEditMode ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Tên tiện nghi"
          placeholder="VD: WiFi, Máy lạnh, Bồn tắm..."
          required
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          autoFocus
          disabled={isSubmitting}
        />

        <Input
          label="Biểu tượng (icon name)"
          placeholder="VD: wifi, thermometer, bath..."
          value={form.icon}
          onChange={(e) => handleChange('icon', e.target.value)}
          error={errors.icon}
          hint="Tên icon từ thư viện lucide-react (VD: wifi, air-vent, tv...)"
          disabled={isSubmitting}
        />

        {/* Icon preview */}
        {form.icon.trim() && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary-50 px-3 py-2">
            <DynamicIcon name={form.icon} className="h-5 w-5 text-primary-500" />
            <span className="text-xs text-secondary-500">Xem trước icon</span>
          </div>
        )}

        <Textarea
          label="Mô tả"
          placeholder="Mô tả ngắn về tiện nghi..."
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          disabled={isSubmitting}
        />
      </div>
    </Modal>
  );
}
