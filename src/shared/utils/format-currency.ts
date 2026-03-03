// ================================================================
// Currency formatting utilities — Vietnamese Đồng (VND)
// ================================================================

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

/**
 * Format a number as Vietnamese Đồng currency.
 *
 * @example
 * formatCurrency(150000)  // '150.000 ₫'
 * formatCurrency(0)       // '0 ₫'
 * formatCurrency(null)    // ''
 */
export function formatCurrency(
  value: number | undefined | null,
): string {
  if (value == null) return '';
  return vndFormatter.format(value);
}

/**
 * Format a number with thousand separators (no currency symbol).
 *
 * @example
 * formatNumber(150000)  // '150.000'
 */
export function formatNumber(
  value: number | undefined | null,
): string {
  if (value == null) return '';
  return numberFormatter.format(value);
}
