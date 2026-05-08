import api from './api';
import type { ApiResponse, Page } from '@/shared/types';

export type CacheStats = {
  objectCount: number;
  counterCount: number;
  lockCount: number;
  total: number;
};

export type CacheEntry = {
  key: string;
  type: string;
  value: any;
  ttlSeconds: number;
  remainingTtlSeconds: number;
};

export async function getCacheStats() {
  const { data } = await api.get<ApiResponse<CacheStats>>('/admin/cache/stats');
  return data.data;
}

export async function getCaches(params?: any) {
  const { data } = await api.get<ApiResponse<Page<CacheEntry>>>('/admin/cache', { params });
  return data.data;
}

export async function clearAllCaches(pattern?: string) {
  const { data } = await api.delete<ApiResponse<any>>('/admin/cache', { params: { pattern } });
  return data.data;
}

export async function deleteCacheEntry(key: string) {
  const { data } = await api.delete<ApiResponse<any>>('/admin/cache/entry', { params: { key } });
  return data.data;
}

export async function createCacheEntry(payload: { fullKey: string; value: any; ttlSeconds: number }) {
  const { data } = await api.post<ApiResponse<CacheEntry>>('/admin/cache/entry', payload);
  return data.data;
}

export async function updateCacheEntry(key: string, payload: { value: any; ttlSeconds: number }) {
  const { data } = await api.put<ApiResponse<CacheEntry>>('/admin/cache/entry', payload, { params: { key } });
  return data.data;
}
