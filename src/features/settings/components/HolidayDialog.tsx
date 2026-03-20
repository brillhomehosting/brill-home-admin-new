import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { CalendarRange } from 'lucide-react';

type HolidayType = 'YEARLY' | 'SPECIFIC_YEAR';

type HolidayFormValues = {
  name: string;
  type: HolidayType;
  startDate: string;
  endDate: string;
};

const DEFAULT_VALUES: HolidayFormValues = {
  name: '',
  type: 'YEARLY',
  startDate: '', // Format DD/MM or YYYY-MM-DD
  endDate: '',   // Format DD/MM or YYYY-MM-DD
};

type HolidayDialogProps = {
  open: boolean;
  onClose: () => void;
  initialData?: any | null;
  onSuccess?: () => void;
};

export function HolidayDialog({ open, onClose, initialData, onSuccess }: HolidayDialogProps) {
  const [form, setForm] = useState<HolidayFormValues>(DEFAULT_VALUES);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name,
          type: initialData.type,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
        });
      } else {
        setForm(DEFAULT_VALUES);
      }
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    if (!form.name || !form.startDate || !form.endDate) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    
    // Validate DD/MM format if YEARLY
    if (form.type === 'YEARLY') {
      const ddmmRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])$/;
      if (!ddmmRegex.test(form.startDate) || !ddmmRegex.test(form.endDate)) {
        alert('Định dạng ngày (Hằng năm) phải là DD/MM (VD: 30/04).');
        return;
      }
    } else {
      // Validate date order for SPECIFIC_YEAR
      if (new Date(form.endDate) < new Date(form.startDate)) {
        alert('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
        return;
      }
    }

    console.log('Submit Holiday', form);
    onSuccess?.();
    onClose();
  };

  const isEdit = !!initialData;

  // Render Date Inputs depending on Type
  const renderDateInputs = () => {
    if (form.type === 'YEARLY') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
              Ngày bắt đầu <span className="text-danger-500">*</span>
            </label>
            <Input
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              placeholder="VD: 30/04"
              maxLength={5}
            />
            <p className="mt-1 text-[10px] text-secondary-400">Định dạng: DD/MM</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
              Ngày kết thúc <span className="text-danger-500">*</span>
            </label>
            <Input
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              placeholder="VD: 01/05"
              maxLength={5}
            />
            <p className="mt-1 text-[10px] text-secondary-400">Định dạng: DD/MM</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
            Từ ngày <span className="text-danger-500">*</span>
          </label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
            Đến ngày <span className="text-danger-500">*</span>
          </label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-500">
            <CalendarRange className="h-4 w-4" />
          </div>
          {isEdit ? 'Sửa thông tin ngày lễ' : 'Thêm ngày lễ mới'}
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="border-border px-5">
            Hủy bỏ
          </Button>
          <Button className="bg-primary-500 text-white hover:bg-primary-600 px-5" onClick={handleSubmit}>
            {isEdit ? 'Cập nhật' : 'Lưu thông tin'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
            Tên ngày lễ <span className="text-danger-500">*</span>
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VD: Tết Dương lịch, Nghỉ bù lễ Quốc Khánh..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
            Phân loại <span className="text-danger-500">*</span>
          </label>
          <Select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as HolidayType, startDate: '', endDate: '' })}
            options={[
              { value: 'YEARLY', label: 'Hằng năm (Lặp lại mỗi năm)' },
              { value: 'SPECIFIC_YEAR', label: 'Một lần (Năm cụ thể)' },
            ]}
          />
        </div>

        {renderDateInputs()}

        <p className="mt-2 text-xs text-secondary-500 italic bg-secondary-50 p-2 text-center rounded">
          * Những loại booking rơi vào khoảng thời gian ngày lễ sẽ auto phát sinh phụ thu.
        </p>
      </div>
    </Modal>
  );
}
