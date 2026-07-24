import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the portfolio shell and working navigation', async ({ page }) => {
  await expect(page).toHaveTitle(/Anders Jensen/i);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  for (const name of ['Profile', 'Experience', 'Contact']) {
    const link = page.getByRole('navigation').getByRole('link', { name });
    await expect(link).toBeVisible();
    await expect(page.locator(await link.getAttribute('href'))).toHaveCount(1);
  }

  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Notes' })
    .click();
  await expect(page).toHaveURL(/blog\.html$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /Thinking in public/i }),
  ).toBeVisible();
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

test('blog page is accessible and does not overflow on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/blog.html');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(results.violations).toEqual([]);
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
