import { test, expect } from '@playwright/test';

const roomId = '11111111-1111-1111-1111-111111111111';
const campaign = {
  id: '22222222-2222-2222-2222-222222222222', name: 'Room weekend test',
  type: 'ROOM_WEEK_DAY', discountType: 'PERCENTAGE', discountValue: 10,
  startDate: '2026-09-01', endDate: '2026-09-30', status: 'ACTIVE',
  targetRoomId: roomId, targetRoomName: 'Room A', targetWeekDay: false,
  targetRoomType: null, targetOvernightSlot: null,
};

test('creates and edits combined campaigns with both target fields', async ({ page }) => {
  const writes: Record<string, unknown>[] = [];
  await page.addInitScript(() => {
    const expiry = Date.now() + 3600000;
    localStorage.setItem('brill_access_token', `test.${btoa(JSON.stringify({ exp: expiry / 1000 }))}.test`);
    localStorage.setItem('brill_refresh_token', 'test');
    localStorage.setItem('brill_access_token_expires_at', String(expiry));
    localStorage.setItem('brill_user', JSON.stringify({ id: 'test', username: 'admin', role: 'ADMIN' }));
  });
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    let data: unknown = {};
    if (request.url().includes('/discount-campaigns')) {
      if (request.method() !== 'GET') {
        const payload = request.postDataJSON();
        writes.push(payload);
        data = { ...campaign, ...payload };
      } else {
        data = { content: [campaign], totalElements: 1, totalPages: 1, number: 0 };
      }
    } else if (request.url().includes('/rooms')) {
      data = { content: [{ id: roomId, name: 'Room A', isActive: true }], totalElements: 1, totalPages: 1 };
    }
    await route.fulfill({ json: { success: true, data } });
  });
  await page.goto('/apps/discounts');
  await page.getByRole('button', { name: 'Tạo chương trình', exact: true }).click();
  await page.getByRole('textbox', { name: 'Tên chương trình', exact: true }).fill('Combined new');
  await page.getByRole('spinbutton', { name: 'Giá trị giảm' }).fill('10');
  await page.getByRole('combobox', { name: 'Loại điều kiện' }).selectOption('ROOM_WEEK_DAY');
  await expect(page.getByRole('radio', { name: 'Cuối tuần (T7–CN)' })).toBeChecked();
  await page.getByRole('combobox', { name: 'Chọn Phòng' }).selectOption(roomId);
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'dd/MM/yyyy', exact: true }).last().click();
    await page.locator('.rdp-day_button').filter({ hasText: /^15$/ }).first().click();
  }
  await page.getByRole('button', { name: 'Tạo mới', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0]).toMatchObject({ type: 'ROOM_WEEK_DAY', targetRoomId: roomId, targetWeekDay: false });
  expect(writes[0]).not.toHaveProperty('targetRoomType');
  expect(writes[0]).not.toHaveProperty('targetOvernightSlot');
  const row = page.locator('tbody tr').filter({ hasText: campaign.name });
  await expect(row).toContainText('Room A · Cuối tuần (T7–CN)');
  await row.locator('button').nth(1).click();
  await expect(page.getByRole('combobox', { name: 'Chọn Phòng' })).toHaveValue(roomId);
  await expect(page.getByRole('radio', { name: 'Cuối tuần (T7–CN)' })).toBeChecked();
  await page.getByRole('radio', { name: 'Ngày thường (T2–T6)' }).check();
  await page.getByRole('button', { name: 'Cập nhật', exact: true }).click();
  await expect.poll(() => writes.length).toBe(2);
  expect(writes[1]).toMatchObject({ type: 'ROOM_WEEK_DAY', targetRoomId: roomId, targetWeekDay: true });
  await row.locator('button').nth(1).click();
  await page.getByRole('combobox', { name: 'Loại điều kiện' }).selectOption('ALL');
  await expect(page.getByRole('combobox', { name: 'Chọn Phòng' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Cập nhật', exact: true }).click();
  await expect.poll(() => writes.length).toBe(3);
  expect(writes[2]).not.toHaveProperty('targetRoomId');
  expect(writes[2]).not.toHaveProperty('targetWeekDay');
});
