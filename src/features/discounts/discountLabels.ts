import type { DiscountCampaign, DiscountTargetType } from '@/shared/types';

const WEEK_DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// ISO weekdays to short text, joining runs: [1, 2, 3, 4, 6] -> "T2–T5, T7".
export function formatWeekDays(days: number[] | null | undefined): string {
  const sorted = [...new Set(days ?? [])].filter((day) => day >= 1 && day <= 7).sort((a, b) => a - b);
  if (sorted.length === 7) return 'Cả tuần';
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    while (i + 1 < sorted.length && sorted[i + 1] === sorted[i] + 1) i++;
    const end = sorted[i];
    const startLabel = WEEK_DAY_LABELS[start - 1];
    const endLabel = WEEK_DAY_LABELS[end - 1];
    parts.push(end - start >= 2 ? `${startLabel}–${endLabel}` : start === end ? startLabel : `${startLabel}, ${endLabel}`);
  }
  return parts.join(', ');
}

export function slotScopeLabel(targetOvernightSlot: boolean | null | undefined): string {
  if (targetOvernightSlot === true) return 'Qua đêm';
  if (targetOvernightSlot === false) return 'Ban ngày';
  return 'Mọi khung';
}

export function discountTypeLabel(type: DiscountTargetType): string {
  if (type === 'WEEKDAY_SLOT') return 'Thứ + khung giờ';
  if (type === 'ROOM_WEEK_DAY') return 'Phòng + ngày';
  return type;
}

export function discountScope(campaign: DiscountCampaign): string {
  const dayLabel = campaign.targetWeekDay ? 'Ngày thường (T2–T6)' : 'Cuối tuần (T7–CN)';
  switch (campaign.type) {
    case 'WEEKDAY_SLOT': {
      const rooms = campaign.targetRoomNames?.length ? campaign.targetRoomNames.join(', ') : 'Tất cả phòng';
      return `${rooms} · ${formatWeekDays(campaign.targetWeekDays)} · ${slotScopeLabel(campaign.targetOvernightSlot)}`;
    }
    case 'ROOM_WEEK_DAY':
      return `${campaign.targetRoomName || campaign.targetRoomId} · ${dayLabel}`;
    case 'ROOM':
      return campaign.targetRoomName || campaign.targetRoomId || '';
    case 'WEEK_DAY':
      return dayLabel;
    case 'ROOM_TYPE':
      return campaign.targetRoomType || '';
    case 'SLOT_TYPE':
      return campaign.targetOvernightSlot ? 'Slot qua đêm' : 'Slot ban ngày';
    case 'ALL':
      return 'Toàn hệ thống';
  }
}
