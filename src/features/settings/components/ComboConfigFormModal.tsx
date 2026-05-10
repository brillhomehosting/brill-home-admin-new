import { useEffect, useState } from 'react';
import { Modal, Button, Input } from '@/shared/components/ui';
import type { ComboConfig, ComboConfigUpdateRequest } from '@/shared/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ComboConfigUpdateRequest) => void;
  config?: ComboConfig;
  isSubmitting?: boolean;
};

type FormState = {
  percentageDiscount: string;
  flatDiscount: string;
  isActive: boolean;
};

export function ComboConfigFormModal({
  open,
  onClose,
  onSubmit,
  config,
  isSubmitting = false,
}: Props) {
  const [form, setForm] = useState<FormState>({
    percentageDiscount: '',
    flatDiscount: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open && config) {
      setForm({
        percentageDiscount: String(config.percentageDiscount),
        flatDiscount: String(config.flatDiscount),
        isActive: config.isActive,
      });
      setErrors({});
    }
  }, [open, config]);

  const set = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    const pct = parseFloat(form.percentageDiscount);
    if (isNaN(pct) || pct < 0 || pct > 100) next.percentageDiscount = '% giảm giá phải từ 0 đến 100';
    const flat = parseInt(form.flatDiscount, 10);
    if (isNaN(flat) || flat < 0) next.flatDiscount = 'Giảm cố định phải >= 0';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSubmit({
      percentageDiscount: parseFloat(form.percentageDiscount),
      flatDiscount: parseInt(form.flatDiscount, 10),
      isActive: form.isActive,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chỉnh sửa combo"
      size="md"
      closeOnOverlayClick={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} loading={isSubmitting}>
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Read-only min slots display */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-dim/40 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary-400 mb-0.5">Min Slots</p>
            <p className="text-lg font-black text-primary-600">{config?.minSlots} slots</p>
          </div>
          <span className="text-xs text-secondary-400 italic">Không thể thay đổi</span>
        </div>

        <Input
          label="% Giảm giá"
          type="number"
          placeholder="0 – 100"
          required
          min={0}
          max={100}
          step={0.1}
          value={form.percentageDiscount}
          onChange={(e) => set('percentageDiscount', e.target.value)}
          error={errors.percentageDiscount}
          disabled={isSubmitting}
          hint="Phần trăm giảm trên tổng giá trị đơn hàng"
        />

        <Input
          label="Giảm cố định (VNĐ)"
          type="number"
          placeholder="0"
          required
          min={0}
          step={1000}
          value={form.flatDiscount}
          onChange={(e) => set('flatDiscount', e.target.value)}
          error={errors.flatDiscount}
          disabled={isSubmitting}
          hint="Số tiền giảm trực tiếp trên giá"
        />

        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-dim/40 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Kích hoạt combo</p>
            <p className="text-xs text-secondary-400">
              Hiển thị combo này cho khách hàng khi đặt phòng
            </p>
          </div>
          <button
            type="button"
            onClick={() => set('isActive', !form.isActive)}
            disabled={isSubmitting}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed ${
              form.isActive ? 'bg-primary-500' : 'bg-secondary-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                form.isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </Modal>
  );
}
