// ================================================================
// Enums — match backend constants
// ================================================================

export const ERoomType = {
  NORMAL: 'NORMAL',
  STANDARD: 'STANDARD',
  VIP: 'VIP',
  PREMIUM: 'PREMIUM',
} as const;
export type ERoomType = (typeof ERoomType)[keyof typeof ERoomType];

export const ERole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type ERole = (typeof ERole)[keyof typeof ERole];

export const EUploadFolder = {
  ROOMS: 'ROOMS',
  BLOGS: 'BLOGS',
} as const;
export type EUploadFolder = (typeof EUploadFolder)[keyof typeof EUploadFolder];
