import type { DiscountCampaign } from '@/shared/types';

export function discountScope(campaign: DiscountCampaign): string {
  const dayLabel = campaign.targetWeekDay ? 'Ngày thường (T2–T6)' : 'Cuối tuần (T7–CN)';
  switch (campaign.type) {
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
