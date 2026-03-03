// ================================================================
// Date formatting utilities
// ================================================================

/**
 * Format a date string or Date object to a localized display string.
 *
 * @param date  — ISO string or Date object
 * @param options — Intl.DateTimeFormat options (defaults to dd/MM/yyyy)
 * @returns Formatted date string, or empty string if input is falsy
 *
 * @example
 * formatDate('2025-03-01T10:30:00Z')           // '01/03/2025'
 * formatDate('2025-03-01T10:30:00Z', {
 *   dateStyle: 'full',
 * })                                            // 'Thứ Bảy, 1 tháng 3, 2025'
 */
export function formatDate(
  date: string | Date | undefined | null,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(d.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  return new Intl.DateTimeFormat('vi-VN', options ?? defaultOptions).format(d);
}

/**
 * Format a date to dd/MM/yyyy HH:mm.
 */
export function formatDateTime(
  date: string | Date | undefined | null,
): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
