import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountService } from '@/shared/services/discount.service';
import type { GetDiscountsParams, DiscountCampaign } from '@/shared/types';
import { useToast } from '@/shared/components/feedback/Toast';

export const discountKeys = {
  all: ['discounts'] as const,
  lists: () => [...discountKeys.all, 'list'] as const,
  list: (params: GetDiscountsParams) => [...discountKeys.lists(), params] as const,
};

export function useDiscounts(params: GetDiscountsParams) {
  return useQuery({
    queryKey: discountKeys.list(params),
    queryFn: () => discountService.getDiscounts(params),
    placeholderData: (prev) => prev,
  });
}

export function useDiscountMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      discountService.updateDiscountStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      toast('Đã cập nhật trạng thái chiến dịch', 'success');
    },
    onError: () => {
      toast('Không thể cập nhật trạng thái', 'error');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => discountService.deleteDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      toast('Đã xóa chiến dịch giảm giá', 'success');
    },
    onError: () => {
      toast('Xóa thất bại', 'error');
    },
  });

  const create = useMutation({
    mutationFn: (payload: Partial<DiscountCampaign>) => discountService.createDiscount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      toast('Đã tạo chiến dịch giảm giá mới', 'success');
    },
    onError: () => {
      toast('Tạo thất bại', 'error');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DiscountCampaign> }) => 
      discountService.updateDiscount(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      toast('Đã cập nhật chiến dịch', 'success');
    },
    onError: () => {
      toast('Cập nhật thất bại', 'error');
    },
  });

  return { toggleStatus, remove, create, update };
}
