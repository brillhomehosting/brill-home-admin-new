import type { BaseDTO } from './api';

export type SystemConfig = BaseDTO & {
  configKey: string;
  configValue: string;
  description?: string;
  isSystemDefined: boolean;
  isPublic: boolean;
};

export type SystemConfigCreateRequest = {
  configKey: string;
  configValue: string;
  description?: string;
  isPublic?: boolean;
};

export type SystemConfigUpdateRequest = {
  configValue: string;
  description?: string;
  isPublic?: boolean;
};

export type GetSystemConfigsParams = {
  page?: number;
  size?: number;
  configKey?: string;
};
