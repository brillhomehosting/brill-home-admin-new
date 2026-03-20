import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Tag } from 'lucide-react';

type DiscountType = 'ALL' | 'WEEK_DAY' | 'SLOT_TYPE' | 'ROOM_TYPE' | 'ROOM';
type ValueType = 'PERCENTAGE' | 'FIXED_AMOUNT';

type DiscountFormValues = {
  name: string;
  valueType: ValueType;
  value: string;
  startDate: string;
  endDate: string;
  type: DiscountType;
  targetWeekDay: string;
  targetOvernightSlot: string;
  targetRoomType: string;
  targetRoomId: string;
};

const DEFAULT_VALUES: DiscountFormValues = {
  name: '',
  valueType: 'PERCENTAGE',
  value: '',
  startDate: '',
  endDate: '',
  type: 'ALL',
  targetWeekDay: 'WEEKDAY', // WEEKDAY | WEEKEND
  targetOvernightSlot: 'OVERNIGHT', // OVERNIGHT | DAYTIME
  targetRoomType: 'NORMAL',
  targetRoomId: '',
};

type DiscountDialogProps = {
  open: boolean;
  onClose: () => void;
  initialData?: any | null; // Pass null for create
};

export function DiscountDialog({ open, onClose, initialData }: DiscountDialogProps) {
  const [form, setForm] = useState<DiscountFormValues>(DEFAULT_VALUES);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({ ...DEFAULT_VALUES, ...initialData });
      } else {
        setForm(DEFAULT_VALUES);
      }
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    // Basic validation
    if (!form.name || !form.value || !form.startDate || !form.endDate) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    
    if (form.valueType === 'PERCENTAGE' && Number(form.value) > 100) {
      const confirm = window.confirm('Giảm giá vượt quá 100%. Bạn có chắc chắn muốn tạo flash sale này?');
      if (!confirm) return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      alert('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
      return;
    }

    console.log('Submit', form);
    onClose();
  };

  const isEdit = !!initialData;

  // Mock rooms
  const rooms = [
    { id: 'r1', name: 'Phòng Cinema' },
    { id: 'r2', name: 'Phòng Vintage' },
    { id: 'r3', name: 'Phòng Minimalist' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-500">
            <Tag className="h-4 w-4" />
          </div>
          {isEdit ? 'Sửa Chương Trình Giảm Giá' : 'Tạo Chương Trình Mới'}
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="border-border px-5">
            Hủy bỏ
          </Button>
          <Button className="bg-primary-500 text-white hover:bg-primary-600 px-5" onClick={handleSubmit}>
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        
        {/* Bước 1 */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-100 text-xs text-secondary-600">1</span>
            Thông tin cơ bản
          </h3>
          <div className="grid gap-4 rounded-xl border border-border bg-surface p-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                Tên chương trình <span className="text-danger-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Flash Sale 20/11..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                  Kiểu giảm <span className="text-danger-500">*</span>
                </label>
                <Select
                  value={form.valueType}
                  onChange={(e) => setForm({ ...form, valueType: e.target.value as ValueType })}
                  options={[
                    { value: 'PERCENTAGE', label: 'Theo Phần trăm (%)' },
                    { value: 'FIXED_AMOUNT', label: 'Theo Số tiền (VNĐ)' },
                  ]}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                  Giá trị giảm <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder={form.valueType === 'PERCENTAGE' ? 'VD: 10' : 'VD: 50.000'}
                    className="pr-8"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 font-semibold text-secondary-500">
                    {form.valueType === 'PERCENTAGE' ? '%' : 'đ'}
                  </div>
                </div>
              </div>
            </div>

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
          </div>
        </div>

        {/* Bước 2 */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-100 text-xs text-secondary-600">2</span>
            Phạm vi áp dụng
          </h3>
          <div className="rounded-xl border border-border bg-surface p-4">
            <label className="mb-3 block text-xs font-semibold text-secondary-500">
              Loại điều kiện
            </label>
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as DiscountType })}
              className="mb-4"
              options={[
                { value: 'ALL', label: 'Tất cả booking' },
                { value: 'WEEK_DAY', label: 'Theo Ngày (Thường/Cuối tuần)' },
                { value: 'SLOT_TYPE', label: 'Theo Khung giờ (Ngày/Đêm)' },
                { value: 'ROOM_TYPE', label: 'Theo Loại phòng' },
                { value: 'ROOM', label: 'Theo Phòng cụ thể' },
              ]}
            />

            {/* Dynamic Fields */}
            {form.type === 'ALL' && (
              <div className="rounded-lg bg-secondary-50 p-3 text-sm text-secondary-600 text-center border border-border">
                Chương trình sẽ áp dụng cho tất cả các booking trong thời hạn.
              </div>
            )}

            {form.type === 'WEEK_DAY' && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="weekDay"
                    value="WEEKDAY"
                    checked={form.targetWeekDay === 'WEEKDAY'}
                    onChange={(e) => setForm({ ...form, targetWeekDay: e.target.value })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  Ngày thường (T2–T6)
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="weekDay"
                    value="WEEKEND"
                    checked={form.targetWeekDay === 'WEEKEND'}
                    onChange={(e) => setForm({ ...form, targetWeekDay: e.target.value })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  Cuối tuần (T7–CN)
                </label>
              </div>
            )}

            {form.type === 'SLOT_TYPE' && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="slotType"
                    value="DAYTIME"
                    checked={form.targetOvernightSlot === 'DAYTIME'}
                    onChange={(e) => setForm({ ...form, targetOvernightSlot: e.target.value })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  Slot ban ngày
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="slotType"
                    value="OVERNIGHT"
                    checked={form.targetOvernightSlot === 'OVERNIGHT'}
                    onChange={(e) => setForm({ ...form, targetOvernightSlot: e.target.value })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  Slot qua đêm
                </label>
              </div>
            )}

            {form.type === 'ROOM_TYPE' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                  Chọn Loại Phòng
                </label>
                <Select
                  value={form.targetRoomType}
                  onChange={(e) => setForm({ ...form, targetRoomType: e.target.value })}
                  options={[
                    { value: 'NORMAL', label: 'NORMAL' },
                    { value: 'STANDARD', label: 'STANDARD' },
                    { value: 'VIP', label: 'VIP' },
                    { value: 'PREMIUM', label: 'PREMIUM' },
                  ]}
                />
              </div>
            )}

            {form.type === 'ROOM' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                  Chọn Phòng
                </label>
                <Select
                  value={form.targetRoomId}
                  onChange={(e) => setForm({ ...form, targetRoomId: e.target.value })}
                  options={[
                    { value: '', label: '-- Chọn phòng --' },
                    ...rooms.map((r) => ({ value: r.id, label: r.name })),
                  ]}
                />
              </div>
            )}

          </div>
        </div>

      </div>
    </Modal>
  );
}
