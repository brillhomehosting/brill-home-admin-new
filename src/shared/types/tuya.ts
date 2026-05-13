export type TuyaSyncStatus =
  | 'PENDING'
  | 'SYNCED'
  | 'FAILED'
  | 'DELETE_PENDING'
  | 'DELETED'
  | 'DELETE_FAILED';

export type TuyaPasswordItem = {
  bookingId: string;
  bookingCode: string;
  bookingStatus: 'CONFIRMED' | 'CANCELLED' | string;
  guestName: string;
  guestPhone?: string;
  roomId?: string;
  roomName?: string;
  gatePassword?: string;
  passwordEffectiveAt?: string;
  passwordExpiredAt?: string;
  tuyaPasswordId?: string;
  tuyaSyncStatus: TuyaSyncStatus;
  tuyaSyncError?: string;
  checkInAt: string;
  checkOutAt: string;
  updatedAt?: string;
};

export type TuyaPasswordCounts = {
  alreadySetPasswords: number;
  failedSyncPasswords: number;
  pendingRemovePasswords: number;
};

export type TuyaPasswordOverview = {
  counts: TuyaPasswordCounts;
  alreadySetPasswords: TuyaPasswordItem[];
  failedSyncPasswords: TuyaPasswordItem[];
  pendingRemovePasswords: TuyaPasswordItem[];
};

export type TuyaDevicePasswordList = {
  deviceId: string;
  passwords: unknown;
};
