import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { CalendarRange, Loader2 } from 'lucide-react';
import { useHolidayMutations } from '../hooks/useHolidays';
import type { Holiday, HolidayType } from '@/shared/types';
import { useToast } from '@/shared/components/feedback/Toast';

type HolidayFormValues = {
  name: string;
  holidayType: HolidayType;
  startDay: string;
  endDay: string;
};

const DEFAULT_VALUES: HolidayFormValues = {
  name: '',
  holidayType: 'ANNUAL',
  startDay: '',
  endDay: '',
};

type HolidayDialogProps = {
  open: boolean;
  onClose: () => void;
  initialData?: Holiday | null;
  onSuccess?: () => void;
};

export function HolidayDialog({ open, onClose, initialData, onSuccess }: HolidayDialogProps) {
  const [form, setForm] = useState<HolidayFormValues>(DEFAULT_VALUES);
  const { create, update } = useHolidayMutations();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name,
          holidayType: initialData.holidayType,
          startDay: initialData.startDay,
          endDay: initialData.endDay,
        });
      } else {
        setForm(DEFAULT_VALUES);
      }
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    if (!form.name || !form.startDay || !form.endDay) {
      toast('Vui lòng nhập đầy đủ thông tin bắt buộc.', 'error');
      return;
    }
    
    // Basic date validation for SPECIFIC_YEAR
    if (form.holidayType === 'SPECIFIC_YEAR') {
      if (new Date(form.endDay) < new Date(form.startDay)) {
        toast('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.', 'error');
        return;
      }
    }

    const payload = {
      ...form,
    };

    if (initialData) {
      update.mutate({ id: initialData.id, payload }, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        }
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        }
      });
    }
  };

  const isEdit = !!initialData;
  const isPending = create.isPending || update.isPending;

  // Render Date Inputs depending on Type
  const renderDateInputs = () => {
    if (form.holidayType === 'ANNUAL') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
              Ngày bắt đầu <span className="text-danger-500">*</span>
            </label>
            <Input
              value={form.startDay}
              onChange={(e) => setForm({ ...form, startDay: e.target.value })}
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
              value={form.endDay}
              onChange={(e) => setForm({ ...form, endDay: e.target.value })}
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
            value={form.startDay}
            onChange={(e) => setForm({ ...form, startDay: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
            Đến ngày <span className="text-danger-500">*</span>
          </label>
          <Input
            type="date"
            value={form.endDay}
            onChange={(e) => setForm({ ...form, endDay: e.target.value })}
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
          <Button 
            className="bg-primary-500 text-white hover:bg-primary-600 px-5" 
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? 'Cập nhật' : 'Lưu thông tin')}
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
            value={form.holidayType}
            onChange={(e) => setForm({ ...form, holidayType: e.target.value as HolidayType, startDay: '', endDay: '' })}
            options={[
              { value: 'ANNUAL', label: 'Hằng năm (Lặp lại mỗi năm)' },
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
