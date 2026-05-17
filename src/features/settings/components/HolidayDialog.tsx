import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { DateInput } from '@/shared/components/ui/DateInput';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { CalendarRange, Loader2 } from 'lucide-react';
import { useHolidayMutations } from '../hooks/useHolidays';
import type { Holiday, HolidayType, SurchargeType } from '@/shared/types';
import { useToast } from '@/shared/components/feedback/Toast';

type HolidayFormValues = {
  name: string;
  holidayType: HolidayType;
  startDay: string;
  endDay: string;
  surchargeType: SurchargeType;
  surchargeAmount: string;
  surchargePercent: string;
};

const DEFAULT_VALUES: HolidayFormValues = {
  name: '',
  holidayType: 'ANNUAL',
  startDay: '',
  endDay: '',
  surchargeType: 'AMOUNT',
  surchargeAmount: '',
  surchargePercent: '',
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
        // Convert dd/MM/yyyy back to YYYY-MM-DD for date input if SPECIFIC_YEAR
        const formatForInput = (dateStr: string) => {
          if (initialData.holidayType === 'ANNUAL') {
            const [d, m] = dateStr.split('/');
            return `2000-${m}-${d}`; // Use a fixed dummy year for input compatibility
          }
          const [d, m, y] = dateStr.split('/');
          return `${y}-${m}-${d}`;
        };

        setForm({
          name: initialData.name,
          holidayType: initialData.holidayType,
          startDay: formatForInput(initialData.startDay),
          endDay: formatForInput(initialData.endDay),
          surchargeType: initialData.surchargeType || 'AMOUNT',
          surchargeAmount: String(initialData.surchargeAmount ?? ''),
          surchargePercent: String(initialData.surchargePercent ?? ''),
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

    if (form.surchargeType === 'AMOUNT' && !form.surchargeAmount) {
      toast('Vui lòng nhập số tiền phụ thu.', 'error');
      return;
    }
    if (form.surchargeType === 'PERCENT' && !form.surchargePercent) {
      toast('Vui lòng nhập phần trăm phụ thu.', 'error');
      return;
    }
    
    // Basic date validation for SPECIFIC_YEAR
    if (form.holidayType === 'SPECIFIC_YEAR') {
      if (new Date(form.endDay) < new Date(form.startDay)) {
        toast('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.', 'error');
        return;
      }
    }

    // Convert YYYY-MM-DD to backend format (dd/MM or dd/MM/yyyy)
    const formatForBackend = (dateStr: string) => {
      const [y, m, d] = dateStr.split('-');
      if (form.holidayType === 'ANNUAL') return `${d}/${m}`;
      return `${d}/${m}/${y}`;
    };

    const payload = {
      name: form.name,
      holidayType: form.holidayType,
      startDay: formatForBackend(form.startDay),
      endDay: formatForBackend(form.endDay),
      surchargeType: form.surchargeType,
      surchargeAmount: Number(form.surchargeAmount) || 0,
      surchargePercent: Number(form.surchargePercent) || 0,
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
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
            {form.holidayType === 'ANNUAL' ? 'Ngày bắt đầu' : 'Từ ngày'} <span className="text-danger-500">*</span>
          </label>
          <DateInput
            value={form.startDay}
            onChange={(value) => setForm({ ...form, startDay: value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
            {form.holidayType === 'ANNUAL' ? 'Ngày kết thúc' : 'Đến ngày'} <span className="text-danger-500">*</span>
          </label>
          <DateInput
            value={form.endDay}
            onChange={(value) => setForm({ ...form, endDay: value })}
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

        {/* Surcharge Section */}
        <div className="border-t border-border pt-4">
          <h4 className="mb-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Phụ thu</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                Loại phụ thu <span className="text-danger-500">*</span>
              </label>
              <Select
                value={form.surchargeType}
                onChange={(e) => setForm({ ...form, surchargeType: e.target.value as SurchargeType })}
                options={[
                  { value: 'AMOUNT', label: 'Số tiền cố định (VNĐ)' },
                  { value: 'PERCENT', label: 'Phần trăm (%)' },
                ]}
              />
            </div>
            <div>
              {form.surchargeType === 'AMOUNT' ? (
                <>
                  <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                    Số tiền <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={form.surchargeAmount}
                      onChange={(e) => setForm({ ...form, surchargeAmount: e.target.value })}
                      placeholder="VD: 100000"
                      className="pr-8"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 font-semibold text-secondary-500">
                      đ
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                    Phần trăm <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={form.surchargePercent}
                      onChange={(e) => setForm({ ...form, surchargePercent: e.target.value })}
                      placeholder="VD: 20"
                      className="pr-8"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 font-semibold text-secondary-500">
                      %
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="mt-2 text-xs text-secondary-500 italic bg-secondary-50 p-2 text-center rounded">
          * Những loại booking rơi vào khoảng thời gian ngày lễ sẽ auto phát sinh phụ thu.
        </p>
      </div>
    </Modal>
  );
}
