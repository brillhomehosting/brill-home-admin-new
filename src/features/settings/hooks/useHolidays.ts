import { useToast } from '@/shared/components/feedback/Toast';
import { holidayService } from '@/shared/services/holiday.service';
import type { GetHolidaysParams, Holiday } from '@/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const holidayKeys = {
  all: ['holidays'] as const,
  lists: () => [...holidayKeys.all, 'list'] as const,
  list: (params: GetHolidaysParams) => [...holidayKeys.lists(), params] as const,
};

export function useHolidays(params: GetHolidaysParams) {
  return useQuery({
    queryKey: holidayKeys.list(params),
    queryFn: () => holidayService.getHolidays(params),
    placeholderData: (prev) => prev,
  });
}

export function useHolidayMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const create = useMutation({
    mutationFn: (payload: Partial<Holiday>) => holidayService.createHoliday(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.lists() });
      toast('Đã thêm ngày lễ mới', 'success');
    },
    onError: () => {
      toast('Thêm thất bại', 'error');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Holiday> }) => 
      holidayService.updateHoliday(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.lists() });
      toast('Đã cập nhật thông tin ngày lễ', 'success');
    },
    onError: () => {
      toast('Cập nhật thất bại', 'error');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => holidayService.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.lists() });
      toast('Đã xóa ngày lễ', 'success');
    },
    onError: () => {
      toast('Xóa thất bại', 'error');
    },
  });

  return { create, update, remove };
}
