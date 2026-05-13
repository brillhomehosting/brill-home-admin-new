import { API } from '@/shared/constants';
import type { ApiResponse, TuyaDevicePasswordList, TuyaPasswordItem, TuyaPasswordOverview } from '@/shared/types';
import api from './api';

export async function getTuyaPasswordOverview(limit = 20) {
  const { data } = await api.get<ApiResponse<TuyaPasswordOverview>>(
    API.TUYA_PASSWORDS.OVERVIEW,
    { params: { limit } },
  );
  return data.data;
}

export async function syncTuyaPassword(bookingId: string) {
  const { data } = await api.post<ApiResponse<TuyaPasswordItem>>(
    API.TUYA_PASSWORDS.SYNC(bookingId),
  );
  return data.data;
}

export async function getTuyaDevicePasswords() {
  const { data } = await api.get<ApiResponse<TuyaDevicePasswordList>>(
    API.TUYA_PASSWORDS.DEVICE_PASSWORDS,
  );
  return data.data;
}

export const tuyaPasswordService = {
  getTuyaPasswordOverview,
  syncTuyaPassword,
  getTuyaDevicePasswords,
};
