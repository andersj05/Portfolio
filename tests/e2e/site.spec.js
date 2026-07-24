import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the portfolio shell and working navigation', async ({ page }) => {
  await expect(page).toHaveTitle(/Anders Jensen/i);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  for (const name of ['About', 'Projects', 'Contact']) {
    const link = page.getByRole('navigation').getByRole('link', { name });
    await expect(link).toBeVisible();
    await expect(page.locator(await link.getAttribute('href'))).toHaveCount(1);
  }
});

test('has no detectable WCAG A or AA accessibility violations', async ({
  page,
}) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});

test('does not overflow horizontally', async ({ page }) => {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
