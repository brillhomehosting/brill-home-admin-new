import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { DateInput } from '@/shared/components/ui/DateInput';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Tag, Loader2 } from 'lucide-react';
import { useDiscountMutations } from '../hooks/useDiscounts';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import type { 
  Room,
  DiscountCampaign, 
  DiscountTargetType, 
  DiscountValueType,
  DiscountStatus
} from '@/shared/types';
import { useToast } from '@/shared/components/feedback/Toast';

type DiscountFormValues = {
  name: string;
  discountType: DiscountValueType;
  discountValue: string;
  startDate: string;
  endDate: string;
  type: DiscountTargetType;
  targetWeekDay: boolean;
  targetOvernightSlot: boolean;
  targetRoomType: string;
  targetRoomId: string;
  status: DiscountStatus;
};

const DEFAULT_VALUES: DiscountFormValues = {
  name: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  startDate: '',
  endDate: '',
  type: 'ALL',
  targetWeekDay: false,
  targetOvernightSlot: false,
  targetRoomType: 'NORMAL',
  targetRoomId: '',
  status: 'ACTIVE',
};

type DiscountDialogProps = {
  open: boolean;
  onClose: () => void;
  initialData?: DiscountCampaign | null;
};

export function DiscountDialog({ open, onClose, initialData }: DiscountDialogProps) {
  const [form, setForm] = useState<DiscountFormValues>(DEFAULT_VALUES);
  const { toast } = useToast();
  const { create, update } = useDiscountMutations();
  const { data: roomsResponse } = useRooms({ limit: 100 });
  const rooms = roomsResponse?.data.content || [];

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name,
          discountType: initialData.discountType,
          discountValue: String(initialData.discountValue),
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          type: initialData.type,
          targetWeekDay: initialData.targetWeekDay,
          targetOvernightSlot: initialData.targetOvernightSlot,
          targetRoomType: initialData.targetRoomType,
          targetRoomId: initialData.targetRoomId,
          status: initialData.status,
        });
      } else {
        setForm(DEFAULT_VALUES);
      }
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    if (!form.name || !form.discountValue || !form.startDate || !form.endDate) {
      toast('Vui lòng nhập đầy đủ thông tin bắt buộc.', 'error');
      return;
    }

    if (form.type === 'ROOM' && !form.targetRoomId) {
      toast('Vui lòng chọn phòng áp dụng.', 'error');
      return;
    }
    
    // Build payload with only relevant target fields based on type
    const base = {
      name: form.name,
      type: form.type,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
    };

    let payload: Record<string, any> = { ...base };

    switch (form.type) {
      case 'WEEK_DAY':
        payload.targetWeekDay = form.targetWeekDay;
        break;
      case 'SLOT_TYPE':
        payload.targetOvernightSlot = form.targetOvernightSlot;
        break;
      case 'ROOM_TYPE':
        payload.targetRoomType = form.targetRoomType;
        break;
      case 'ROOM':
        payload.targetRoomId = form.targetRoomId;
        break;
      case 'ALL':
        // No target fields needed
        break;
    }

    if (initialData) {
      update.mutate({ id: initialData.id, payload }, {
        onSuccess: onClose
      });
    } else {
      create.mutate(payload, {
        onSuccess: onClose
      });
    }
  };

  const isEdit = !!initialData;


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
          <Button 
            className="bg-primary-500 text-white hover:bg-primary-600 px-5" 
            onClick={handleSubmit}
            disabled={create.isPending || update.isPending}
          >
            {create.isPending || update.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              isEdit ? 'Cập nhật' : 'Tạo mới'
            )}
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
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
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
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === 'PERCENTAGE' ? 'VD: 10' : 'VD: 50.000'}
                    className="pr-8"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 font-semibold text-secondary-500">
                    {form.discountType === 'PERCENTAGE' ? '%' : 'đ'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                  Từ ngày <span className="text-danger-500">*</span>
                </label>
                <DateInput
                  value={form.startDate}
                  onChange={(value) => setForm({ ...form, startDate: value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-secondary-500">
                  Đến ngày <span className="text-danger-500">*</span>
                </label>
                <DateInput
                  value={form.endDate}
                  onChange={(value) => setForm({ ...form, endDate: value })}
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
              onChange={(e) => setForm({ 
                ...form, 
                type: e.target.value as any,
                // Reset some fields if type changes
                targetRoomId: '',
                targetWeekDay: false,
                targetOvernightSlot: false,
              })}
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
                    checked={form.targetWeekDay}
                    onChange={() => setForm({ ...form, targetWeekDay: true })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  Ngày thường (T2–T6)
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="weekDay"
                    checked={!form.targetWeekDay}
                    onChange={() => setForm({ ...form, targetWeekDay: false })}
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
                    checked={!form.targetOvernightSlot}
                    onChange={() => setForm({ ...form, targetOvernightSlot: false })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  Slot ban ngày
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="slotType"
                    checked={form.targetOvernightSlot}
                    onChange={() => setForm({ ...form, targetOvernightSlot: true })}
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
                    ...rooms.map((r: Room) => ({ value: r.id, label: r.name })),
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
