import {
  Save,
  Trash2,
  X,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import { formatCurrency } from '@/shared/utils';
import { Button } from '@/shared/components/ui';
import type { TimeSlotDraft } from './TimeSlotManager';
import type { CreateTimeSlotData } from '@/shared/types';

// ── Shared input class ──
const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400';

// ================================================================
// TimeSlotRow — single editable time-slot row
// ================================================================

type Props = {
  slot: TimeSlotDraft;
  isSaving: boolean;
  onChange: (id: string, field: keyof CreateTimeSlotData, value: unknown) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

export function TimeSlotRow({
  slot,
  isSaving,
  onChange,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  const isEditing = slot.isDirty || slot.isNew;

  const borderColor = slot.isNew
    ? 'border-success-300 bg-success-50/30'
    : slot.isDirty
      ? 'border-warning-300 bg-warning-50/30'
      : 'border-border';

  return (
    <div className={cn('rounded-lg border p-3 transition-colors sm:p-4', borderColor)}>
      {/* ── Header: status left / actions right ── */}
      <div className="mb-3 flex items-center justify-between gap-2">
        {/* Status */}
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-secondary-400" />
          <span
            className={cn(
              'text-xs font-medium',
              slot.isNew
                ? 'text-success-600'
                : slot.isDirty
                  ? 'text-warning-600'
                  : 'text-secondary-400',
            )}
          >
            {slot.isNew ? 'Mới' : slot.isDirty ? 'Đã chỉnh sửa' : 'Đã lưu'}
          </span>
          {slot.price > 0 && !isEditing && (
            <span className="ml-1 text-xs text-secondary-400">
              · {formatCurrency(slot.price)}
            </span>
          )}
        </div>

        {/* Action buttons — compact icon-buttons */}
        <div className="flex items-center gap-1">
          {isEditing && (
            <>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="h-7 gap-1 px-2 text-[11px] sm:px-2.5"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {slot.isNew ? 'Tạo' : 'Lưu'}
                </span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSaving}
                className="h-7 gap-1 px-2 text-[11px]"
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Hủy</span>
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isSaving}
            className="h-7 px-2 text-danger-500 hover:bg-danger-50 hover:text-danger-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Fields grid ── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:gap-3">
        {/* Start time */}
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-secondary-500">
            Bắt đầu
          </span>
          <input
            type="time"
            value={slot.startTime}
            onChange={(e) => onChange(slot.id, 'startTime', e.target.value)}
            className={inputCls}
          />
        </label>

        {/* End time */}
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-secondary-500">
            Kết thúc
          </span>
          <input
            type="time"
            value={slot.endTime}
            onChange={(e) => onChange(slot.id, 'endTime', e.target.value)}
            className={inputCls}
          />
        </label>

        {/* Price */}
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-secondary-500">
            Giá (₫)
          </span>
          <input
            type="number"
            min={0}
            step={1000}
            value={slot.price}
            onChange={(e) =>
              onChange(slot.id, 'price', Number(e.target.value) || 0)
            }
            className={inputCls}
          />
        </label>

        {/* Overnight toggle */}
        <label className="flex items-end gap-2 pb-2 sm:pb-0 sm:pt-5">
          <input
            type="checkbox"
            checked={slot.isOvernight}
            onChange={(e) =>
              onChange(slot.id, 'isOvernight', e.target.checked)
            }
            className="h-4 w-4 rounded border-border text-accent-500 focus:ring-accent-400"
          />
          <span className="whitespace-nowrap text-sm text-foreground">
            Qua đêm
          </span>
        </label>
      </div>
    </div>
  );
}
