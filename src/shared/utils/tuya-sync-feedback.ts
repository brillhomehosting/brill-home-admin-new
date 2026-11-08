type TuyaSyncFeedback = {
  message: string;
  variant: 'success' | 'warning' | 'error';
};

/**
 * Toast for a manual Tuya retry. The API answers 200 even when Tuya fails again,
 * so the returned status, not the HTTP result, decides what the admin sees.
 */
export function getTuyaSyncFeedback(status: string, error?: string | null): TuyaSyncFeedback {
  if (status === 'SYNCED') {
    return { message: 'Đồng bộ Tuya thành công', variant: 'success' };
  }
  if (status === 'SKIPPED') {
    return { message: 'Bỏ qua đồng bộ Tuya: giờ check-out đã qua', variant: 'warning' };
  }
  return {
    message: error ? `Đồng bộ Tuya thất bại: ${error}` : 'Đồng bộ Tuya thất bại',
    variant: 'error',
  };
}
