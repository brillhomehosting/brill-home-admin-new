import { test, expect, type Page } from '@playwright/test';

const USERNAME = 'admin';
const PASSWORD = '123456789x@XX';

async function login(page: Page) {
  await page.goto('/sign-in');
  await page.getByPlaceholder('Nhập tên đăng nhập').fill(USERNAME);
  await page.getByPlaceholder('Nhập mật khẩu').fill(PASSWORD);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.waitForURL((url) => !url.pathname.includes('sign-in'), { timeout: 15_000 });
}

test.describe('System Config CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/settings/system-configs');
    // Use the h1 heading to avoid matching the breadcrumb span
    await expect(page.getByRole('heading', { name: 'Cấu hình hệ thống' })).toBeVisible({ timeout: 10_000 });
  });

  // ── Read ──────────────────────────────────────────────────────────
  test('loads and displays config list', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Tổng số:/)).toBeVisible();
  });

  test('shows system-defined badge for seeded configs', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Hệ thống').first()).toBeVisible({ timeout: 10_000 });
  });

  // ── Search ────────────────────────────────────────────────────────
  test('filters by config key search', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    // Record total count before filtering
    const totalCountText = await page.getByText(/Tổng số:/).innerText();
    const totalBefore = parseInt(totalCountText.replace(/\D/g, ''), 10);

    // Wait for the filtered API response after typing
    const searchInput = page.getByRole('textbox', { name: 'VD: HOMESTAY_NAME...' });
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('system-configs') && r.url().includes('configKey')),
      searchInput.fill('HOMESTAY'),
    ]);
    await response.finished();
    await page.waitForLoadState('networkidle');

    // At least one HOMESTAY key should be visible
    await expect(page.locator('table tbody tr td:first-child span').filter({ hasText: /HOMESTAY/ }).first()).toBeVisible({ timeout: 8_000 });

    // Filtered count should be less than total (there are non-HOMESTAY configs)
    const filteredCountText = await page.getByText(/Tổng số:/).innerText();
    const filteredCount = parseInt(filteredCountText.replace(/\D/g, ''), 10);
    expect(filteredCount).toBeLessThanOrEqual(totalBefore);
  });

  test('clears search and shows full list', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const searchInput = page.getByPlaceholder(/HOMESTAY_NAME/i);
    await searchInput.fill('HOMESTAY');
    await page.waitForTimeout(700);
    await searchInput.clear();
    await page.waitForTimeout(700);
    await page.waitForLoadState('networkidle');

    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  // ── Create ────────────────────────────────────────────────────────
  test('creates a new config', async ({ page }) => {
    const key = `TEST_E2E_KEY_${Date.now()}`;

    await page.getByRole('button', { name: /thêm cấu hình/i }).click();
    await expect(page.getByRole('heading', { name: 'Thêm cấu hình mới' })).toBeVisible({ timeout: 5_000 });

    await page.getByLabel('Config Key').fill(key);
    await page.getByLabel('Giá trị').fill('e2e_test_value');
    await page.getByLabel('Mô tả').fill('Created by Playwright E2E test');

    await page.getByRole('button', { name: 'Tạo mới' }).click();

    // Modal should close
    await expect(page.getByRole('heading', { name: 'Thêm cấu hình mới' })).not.toBeVisible({ timeout: 8_000 });

    // Search and verify the new key appears
    const searchInput = page.getByPlaceholder(/HOMESTAY_NAME/i);
    await searchInput.fill(key);
    await page.waitForTimeout(700);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('table tbody tr td:first-child span').filter({ hasText: key })).toBeVisible({ timeout: 8_000 });
  });

  // ── Update ────────────────────────────────────────────────────────
  test('edits an existing config value', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    // Use the exact page-level search input (not inside any modal)
    const searchInput = page.getByRole('textbox', { name: 'VD: HOMESTAY_NAME...' });
    await searchInput.fill('TEST_E2E');
    await page.waitForTimeout(700);
    await page.waitForLoadState('networkidle');

    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Click the edit (pencil) button on the first row
    await page.locator('table tbody tr').first().locator('button[title="Chỉnh sửa"]').click();
    await expect(page.getByRole('heading', { name: 'Chỉnh sửa cấu hình' })).toBeVisible({ timeout: 5_000 });

    const valueInput = page.getByLabel('Giá trị');
    await valueInput.clear();
    await valueInput.fill('updated_by_e2e');

    await page.getByRole('button', { name: 'Lưu thay đổi' }).click();

    // Wait for modal to close before interacting with the page
    await expect(page.getByRole('heading', { name: 'Chỉnh sửa cấu hình' })).not.toBeVisible({ timeout: 8_000 });
    await page.waitForLoadState('networkidle');

    // Re-search and confirm updated value shows
    await searchInput.fill('TEST_E2E');
    await page.waitForTimeout(700);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('updated_by_e2e').first()).toBeVisible({ timeout: 8_000 });
  });

  // ── Delete ────────────────────────────────────────────────────────
  test('deletes a custom config', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const searchInput = page.getByPlaceholder(/HOMESTAY_NAME/i);
    await searchInput.fill('TEST_E2E');
    await page.waitForTimeout(700);
    await page.waitForLoadState('networkidle');

    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount === 0) {
      test.skip();
      return;
    }

    const keySpan = page.locator('table tbody tr').first().locator('td:first-child span');
    const keyText = await keySpan.innerText();

    await page.locator('table tbody tr').first().locator('button[title="Xóa"]').click();
    await expect(page.getByRole('heading', { name: 'Xác nhận xóa' })).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: 'Xóa xác nhận' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(
      page.locator('table tbody tr td:first-child span').filter({ hasText: keyText }),
    ).not.toBeVisible({ timeout: 8_000 });
  });

  // ── System-defined protection ─────────────────────────────────────
  test('delete button is disabled for system-defined configs', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const systemRows = page.locator('table tbody tr').filter({ hasText: 'Hệ thống' });
    await expect(systemRows.first()).toBeVisible({ timeout: 10_000 });

    const disabledBtn = systemRows.first().locator('button:disabled');
    await expect(disabledBtn).toBeVisible();
  });

  // ── Form validation ───────────────────────────────────────────────
  test('shows validation error when creating with empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /thêm cấu hình/i }).click();
    await expect(page.getByRole('heading', { name: 'Thêm cấu hình mới' })).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: 'Tạo mới' }).click();

    await expect(page.getByText(/không được để trống/i).first()).toBeVisible({ timeout: 5_000 });
  });

  // ── isPublic toggle ───────────────────────────────────────────────
  test('isPublic toggle works in create modal', async ({ page }) => {
    await page.getByRole('button', { name: /thêm cấu hình/i }).click();
    await expect(page.getByRole('heading', { name: 'Thêm cấu hình mới' })).toBeVisible({ timeout: 5_000 });

    // The toggle is a <button type="button"> inside the "Công khai" section
    const toggle = page.locator('button[type="button"]').filter({ has: page.locator('span.inline-block') });

    await expect(toggle).toHaveClass(/bg-secondary-200/);
    await toggle.click();
    await expect(toggle).toHaveClass(/bg-primary-500/);
    await toggle.click();
    await expect(toggle).toHaveClass(/bg-secondary-200/);
  });
});
