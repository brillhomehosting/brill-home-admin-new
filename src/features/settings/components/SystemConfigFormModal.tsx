import { useEffect, useState } from 'react';
import { Modal, Button, Input, Textarea } from '@/shared/components/ui';
import type { SystemConfig, SystemConfigCreateRequest, SystemConfigUpdateRequest } from '@/shared/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: SystemConfigCreateRequest | SystemConfigUpdateRequest) => void;
  config?: SystemConfig;
  isSubmitting?: boolean;
};

type FormState = {
  configKey: string;
  configValue: string;
  description: string;
  isPublic: boolean;
};

const empty: FormState = {
  configKey: '',
  configValue: '',
  description: '',
  isPublic: false,
};

export function SystemConfigFormModal({
  open,
  onClose,
  onSubmit,
  config,
  isSubmitting = false,
}: Props) {
  const isEditMode = Boolean(config);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open) {
      if (config) {
        setForm({
          configKey: config.configKey,
          configValue: config.configValue,
          description: config.description ?? '',
          isPublic: config.isPublic,
        });
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  }, [open, config]);

  const set = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!isEditMode && !form.configKey.trim()) next.configKey = 'Config key không được để trống';
    if (!form.configValue.trim()) next.configValue = 'Giá trị không được để trống';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (isEditMode) {
      onSubmit({
        configValue: form.configValue.trim(),
        description: form.description.trim() || undefined,
        isPublic: form.isPublic,
      } as SystemConfigUpdateRequest);
    } else {
      onSubmit({
        configKey: form.configKey.trim().toUpperCase(),
        configValue: form.configValue.trim(),
        description: form.description.trim() || undefined,
        isPublic: form.isPublic,
      } as SystemConfigCreateRequest);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa cấu hình' : 'Thêm cấu hình mới'}
      size="md"
      closeOnOverlayClick={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} loading={isSubmitting}>
            {isEditMode ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Config Key"
          placeholder="VD: HOMESTAY_NAME, MAX_BOOKING_DAYS..."
          required
          value={form.configKey}
          onChange={(e) => set('configKey', e.target.value)}
          error={errors.configKey}
          disabled={isEditMode || isSubmitting}
          hint={isEditMode ? 'Config key không thể thay đổi sau khi tạo' : 'Tự động chuyển thành chữ hoa'}
        />

        <Input
          label="Giá trị"
          placeholder="Nhập giá trị..."
          required
          value={form.configValue}
          onChange={(e) => set('configValue', e.target.value)}
          error={errors.configValue}
          disabled={isSubmitting}
          autoFocus={isEditMode}
        />

        <Textarea
          label="Mô tả"
          placeholder="Mô tả ngắn về cấu hình này..."
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-dim/40 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Công khai (Public)</p>
            <p className="text-xs text-secondary-400">
              Cho phép truy cập từ API công khai (không cần xác thực)
            </p>
          </div>
          <button
            type="button"
            onClick={() => set('isPublic', !form.isPublic)}
            disabled={isSubmitting}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed ${
              form.isPublic ? 'bg-primary-500' : 'bg-secondary-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                form.isPublic ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </Modal>
  );
}
