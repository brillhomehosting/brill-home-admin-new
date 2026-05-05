import { API } from '@/shared/constants';
import type {
    ApiResponse,
    DiscountCampaign,
    GetDiscountsParams,
    PagedApiResponse
} from '@/shared/types';
import api from './api';

/** GET /admin/discount-campaigns */
export async function getDiscounts(params: GetDiscountsParams) {
  const { data } = await api.get<PagedApiResponse<DiscountCampaign>>(
    API.DISCOUNTS.LIST,
    { params }
  );
  return data.data;
}

/** POST /admin/discount-campaigns */
export async function createDiscount(payload: Partial<DiscountCampaign>) {
  const { data } = await api.post<ApiResponse<DiscountCampaign>>(
    API.DISCOUNTS.CREATE,
    payload
  );
  return data.data;
}

/** PUT /admin/discount-campaigns/:id */
export async function updateDiscount(id: string, payload: Partial<DiscountCampaign>) {
  const { data } = await api.put<ApiResponse<DiscountCampaign>>(
    API.DISCOUNTS.UPDATE(id),
    payload
  );
  return data.data;
}

/** DELETE /admin/discount-campaigns/:id */
export async function deleteDiscount(id: string) {
  await api.delete(API.DISCOUNTS.DELETE(id));
}

/** PATCH /admin/discount-campaigns/:id/status */
export async function updateDiscountStatus(id: string, status: string) {
  const { data } = await api.patch<ApiResponse<DiscountCampaign>>(
    API.DISCOUNTS.TOGGLE_STATUS(id),
    { status }
  );
  return data.data;
}

export const discountService = {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  updateDiscountStatus,
};
