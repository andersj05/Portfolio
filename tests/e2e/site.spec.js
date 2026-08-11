import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the portfolio shell and working navigation', async ({ page }) => {
  await expect(page).toHaveTitle(/Anders Jensen/i);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Anders Jensen' }),
  ).toBeVisible();

  for (const name of ['Home', 'Projects', 'Blog']) {
    const link = page.getByRole('navigation').getByRole('link', { name });
    await expect(link).toBeVisible();
  }

  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Projects' })
    .click();
  await expect(page).toHaveURL(/\/projects\.html$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Selected projects' }),
  ).toBeVisible();
  await expect(page.locator('.project-detail')).toHaveCount(4);

  await page.goto('/blog.html');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Blog' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Anthropic Is RL Maxxing Opus 5/i }),
  ).toBeVisible();
});

test('projects page is accessible and does not overflow on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects.html');

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

test('fits the compact home in a standard desktop viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');

  const layout = await page.evaluate(() => {
    const image = document.querySelector('.portrait-frame img');
    const imageBounds = image?.getBoundingClientRect();

    return {
      clientHeight: document.documentElement.clientHeight,
      naturalImageRatio: image
        ? image.naturalWidth / image.naturalHeight
        : null,
      renderedImageRatio: imageBounds
        ? imageBounds.width / imageBounds.height
        : null,
      scrollHeight: document.documentElement.scrollHeight,
    };
  });

  expect(layout.scrollHeight).toBeLessThanOrEqual(layout.clientHeight);
  expect(
    Math.abs(layout.renderedImageRatio - layout.naturalImageRatio),
  ).toBeLessThan(0.01);
});

test('keeps the navigation visible while scrolling', async ({ page }) => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  const header = await page.locator('.site-header').evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return {
      position: styles.position,
      top: element.getBoundingClientRect().top,
    };
  });

  expect(header.position).toBe('sticky');
  expect(Math.abs(header.top)).toBeLessThanOrEqual(1);
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

test('renders a Markdown post as a standalone page', async ({ page }) => {
  await page.goto('/blog/anthropic_opus_5_eval.html');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Anthropic Is RL Maxxing Opus 5',
    }),
  ).toBeVisible();
  await expect(page.locator('.post-content')).toContainText(
    'After looking into Opus 5',
  );
  await expect(page.getByRole('link', { name: 'All posts' })).toBeVisible();
});
