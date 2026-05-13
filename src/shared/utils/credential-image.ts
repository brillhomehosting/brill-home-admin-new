/**
 * Constructs the full URL for a CCCD credential image.
 * Stored values may be full URLs (legacy CDN) or just filenames — handle both.
 */
export function getCredentialImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Extract filename regardless of any leading path segments
  const filename = url.split('/').filter(Boolean).pop() ?? url;
  const base = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/$/, '');
  return `${base}/uploads/credentials/${filename}`;
}
