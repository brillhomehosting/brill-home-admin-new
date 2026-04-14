import api from './api';
import { API } from '@/shared/constants';
import type { 
  ApiResponse, 
  PagedApiResponse, 
  Holiday, 
  GetHolidaysParams 
} from '@/shared/types';

/** GET /admin/holiday-surcharges */
export async function getHolidays(params: GetHolidaysParams) {
  const { data } = await api.get<PagedApiResponse<Holiday>>(
    API.HOLIDAYS.LIST,
    { params }
  );
  return data.data;
}

/** POST /admin/holiday-surcharges */
export async function createHoliday(payload: Partial<Holiday>) {
  const { data } = await api.post<ApiResponse<Holiday>>(
    API.HOLIDAYS.CREATE,
    payload
  );
  return data.data;
}

/** PUT /admin/holiday-surcharges/:id */
export async function updateHoliday(id: string, payload: Partial<Holiday>) {
  const { data } = await api.put<ApiResponse<Holiday>>(
    API.HOLIDAYS.UPDATE(id),
    payload
  );
  return data.data;
}

/** DELETE /admin/holiday-surcharges/:id */
export async function deleteHoliday(id: string) {
  await api.delete(API.HOLIDAYS.DELETE(id));
}

export const holidayService = {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
};
