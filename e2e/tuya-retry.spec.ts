import { test, expect, type Page } from '@playwright/test';

const bookingId = '33333333-3333-3333-3333-333333333333';
const tuyaError = 'code=28841002 msg=No permission. The subscription has expired.';
const booking = {
  bookingId, bookingCode: 'BK0001', status: 'CONFIRMED', source: 'ADMIN', cccdStatus: 'MISSING',
  guestName: 'Nguyen Van A', guestPhone: '0900000000', guestEmail: 'guest@example.com',
  roomId: '11111111-1111-1111-1111-111111111111', roomName: 'Room A', date: '2026-11-10',
  checkInAt: '2026-11-10T14:00:00', checkOutAt: '2026-11-10T18:00:00', createdAt: '2026-11-08T10:00:00',
  finalAmount: 300000, originalAmount: 300000, holidaySurchargeAmount: 0, discountAmount: 0, comboDiscountAmount: 0,
  note: '', nationalIdFrontUrl: '', nationalIdBackUrl: '', slots: [],
  gatePassword: '482913', tuyaSyncStatus: 'FAILED', tuyaPasswordCreated: false,
  copyMessage: 'Mật khẩu cửa cuốn: [Lỗi tạo mật khẩu - cần xử lý]',
};

async function signIn(page: Page) {
  await page.addInitScript(() => {
    const expiry = Date.now() + 3600000;
    localStorage.setItem('brill_access_token', `test.${btoa(JSON.stringify({ exp: expiry / 1000 }))}.test`);
    localStorage.setItem('brill_refresh_token', 'test');
    localStorage.setItem('brill_access_token_expires_at', String(expiry));
    localStorage.setItem('brill_user', JSON.stringify({ id: 'test', username: 'admin', role: 'ADMIN' }));
  });
}

test('booking detail retry reports a failed Tuya sync instead of success', async ({ page }) => {
  // The API answers 200 for both outcomes; only tuyaSyncStatus tells them apart.
  const retryResults = [
    { ...booking, tuyaSyncStatus: 'FAILED', tuyaSyncError: tuyaError },
    { ...booking, tuyaSyncStatus: 'SYNCED', tuyaSyncError: null, tuyaPasswordCreated: true },
  ];
  await signIn(page);
  await page.route('**/api/v1/**', async route => {
    const url = route.request().url();
    let data: unknown = {};
    if (url.includes('/retry-tuya')) {
      data = retryResults.shift();
    } else if (url.includes(`/admin/bookings/${bookingId}`)) {
      data = booking;
    }
    await route.fulfill({ json: { success: true, message: 'OK', data } });
  });

  await page.goto(`/apps/bookings/${bookingId}`);
  await expect(page.getByText('Đồng bộ thất bại', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByText(`Đồng bộ Tuya thất bại: ${tuyaError}`)).toBeVisible();
  await expect(page.getByText('Đồng bộ Tuya thành công')).toHaveCount(0);
  await expect(page.getByText('Đồng bộ thất bại', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByText('Đồng bộ Tuya thành công')).toBeVisible();
  await expect(page.getByText('Đã đồng bộ thành công', { exact: true })).toBeVisible();
});

test('password page sync reports a failed Tuya sync instead of success', async ({ page }) => {
  const row = {
    bookingId, bookingCode: 'BK0001', bookingStatus: 'CONFIRMED', guestName: 'Nguyen Van A', roomName: 'Room A',
    gatePassword: '482913', tuyaSyncStatus: 'FAILED', tuyaSyncError: tuyaError,
    checkInAt: '2026-11-10T14:00:00', checkOutAt: '2026-11-10T18:00:00',
  };
  await signIn(page);
  await page.route('**/api/v1/**', async route => {
    const url = route.request().url();
    let data: unknown = {};
    if (url.includes(`/tuya-passwords/${bookingId}/sync`)) {
      data = row;
    } else if (url.includes('/tuya-passwords/overview')) {
      data = {
        counts: { alreadySetPasswords: 0, failedSyncPasswords: 1, pendingRemovePasswords: 0 },
        alreadySetPasswords: [], failedSyncPasswords: [row], pendingRemovePasswords: [],
      };
    } else if (url.includes('/tuya-passwords/device-passwords')) {
      data = { deviceId: 'device', passwords: [] };
    }
    await route.fulfill({ json: { success: true, message: 'OK', data } });
  });

  await page.goto('/apps/tuya-passwords');
  await page.getByRole('button', { name: /Failed Sync Password/ }).click();
  await page.getByRole('button', { name: 'Sync password', exact: true }).click();
  await expect(page.getByText(`Đồng bộ Tuya thất bại: ${tuyaError}`)).toBeVisible();
  await expect(page.getByText('Đồng bộ Tuya thành công')).toHaveCount(0);
});
