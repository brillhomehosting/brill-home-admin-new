import { test, expect } from '@playwright/test';

const roomA = '11111111-1111-1111-1111-111111111111';
const roomB = '33333333-3333-3333-3333-333333333333';
const campaign = {
  id: '44444444-4444-4444-4444-444444444444', name: 'T6 ban ngay',
  type: 'WEEKDAY_SLOT', discountType: 'FIXED_AMOUNT', discountValue: 20000,
  startDate: '2026-11-01', endDate: '2026-11-30', status: 'ACTIVE',
  targetWeekDays: [5], targetRoomIds: [roomA], targetRoomNames: ['Room A'], targetOvernightSlot: false,
  targetRoomId: null, targetRoomName: null, targetWeekDay: null, targetRoomType: null,
};

test('creates and edits weekday + slot campaigns for chosen rooms', async ({ page }) => {
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
      data = {
        content: [
          { id: roomA, name: 'Room A', isActive: true },
          { id: roomB, name: 'Room B', isActive: true },
          { id: '55555555-5555-5555-5555-555555555555', name: 'Closed room', isActive: false },
        ],
        totalElements: 3, totalPages: 1,
      };
    }
    await route.fulfill({ json: { success: true, data } });
  });

  await page.goto('/apps/discounts');
  const row = page.locator('tbody tr').filter({ hasText: campaign.name });
  await expect(row).toContainText('Room A · T6 · Ban ngày');
  await expect(row).toContainText('Thứ + khung giờ');

  // Create: Friday, day slots only, Room A and Room B.
  await page.getByRole('button', { name: 'Tạo chương trình', exact: true }).click();
  await page.getByRole('textbox', { name: 'Tên chương trình', exact: true }).fill('T6 ban ngay new');
  await page.getByRole('spinbutton', { name: 'Giá trị giảm' }).fill('20000');
  await page.getByRole('combobox', { name: 'Loại điều kiện' }).selectOption('WEEKDAY_SLOT');
  const days = page.getByRole('group', { name: 'Thứ áp dụng' });
  const rooms = page.getByRole('group', { name: 'Phòng áp dụng' });
  await expect(rooms.getByRole('button', { name: 'Tất cả phòng' })).toHaveAttribute('aria-pressed', 'true');
  await expect(rooms.getByRole('button', { name: 'Closed room' })).toHaveCount(0);
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'dd/MM/yyyy', exact: true }).last().click();
    await page.locator('.rdp-day_button').filter({ hasText: /^15$/ }).first().click();
  }

  // No weekday chosen: nothing is sent.
  await page.getByRole('button', { name: 'Tạo mới', exact: true }).click();
  await expect(page.getByText('Vui lòng chọn ít nhất một thứ.')).toBeVisible();
  expect(writes).toHaveLength(0);

  await days.getByRole('button', { name: 'T6', exact: true }).click();
  await page.getByRole('radio', { name: 'Ban ngày' }).check();
  await rooms.getByRole('button', { name: 'Room B' }).click();
  await rooms.getByRole('button', { name: 'Room A' }).click();
  await expect(rooms.getByRole('button', { name: 'Tất cả phòng' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Tạo mới', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0]).toMatchObject({
    type: 'WEEKDAY_SLOT', targetWeekDays: [5], targetRoomIds: [roomB, roomA], targetOvernightSlot: false,
  });
  expect(writes[0]).not.toHaveProperty('targetRoomId');
  expect(writes[0]).not.toHaveProperty('targetWeekDay');

  // Edit: the saved targets are shown, then switch to Monday-Friday, every slot, every room.
  await row.locator('button').nth(1).click();
  await expect(days.getByRole('button', { name: 'T6', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(days.getByRole('button', { name: 'T5', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('radio', { name: 'Ban ngày' })).toBeChecked();
  await expect(rooms.getByRole('button', { name: 'Room A' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Chọn T2–T6' }).click();
  await page.getByRole('radio', { name: 'Tất cả khung' }).check();
  await rooms.getByRole('button', { name: 'Tất cả phòng' }).click();
  await page.getByRole('button', { name: 'Cập nhật', exact: true }).click();
  await expect.poll(() => writes.length).toBe(2);
  expect(writes[1]).toMatchObject({
    type: 'WEEKDAY_SLOT', targetWeekDays: [1, 2, 3, 4, 5], targetRoomIds: [], targetOvernightSlot: null,
  });

  // Switching to an older type drops the new targets.
  await row.locator('button').nth(1).click();
  await page.getByRole('combobox', { name: 'Loại điều kiện' }).selectOption('ALL');
  await expect(page.getByRole('group', { name: 'Thứ áp dụng' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Cập nhật', exact: true }).click();
  await expect.poll(() => writes.length).toBe(3);
  expect(writes[2]).not.toHaveProperty('targetWeekDays');
  expect(writes[2]).not.toHaveProperty('targetRoomIds');
});
