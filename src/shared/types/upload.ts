import type { EUploadFolder } from './enums';

// ================================================================
// Upload domain types
// ================================================================

export type UploadResponse = {
  url: string;
  publicId?: string;
  filename?: string;
};

export type { EUploadFolder as UploadFolder };
