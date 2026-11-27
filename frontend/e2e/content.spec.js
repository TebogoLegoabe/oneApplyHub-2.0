const { test, expect } = require('./fixtures');

test.describe('Reviews, bursaries and internships', () => {
  test('reviews page lists approved reviews with filters', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.getByRole('heading', { level: 1, name: 'Accommodation reviews' })).toBeVisible();
    await expect(page.getByText('4 reviews found')).toBeVisible();
    await expect(page.getByText(/Five minutes to class/)).toBeVisible();

    await page.getByLabel('Minimum rating').selectOption('4');
    await expect(page.getByText('3 reviews found')).toBeVisible();
    await expect(page.getByText(/noisy on weekends/)).toBeHidden();
  });

  test('bursary hub filters by field and switches to internships', async ({ page }) => {
    await page.goto('/bursaries');
    await expect(page.getByRole('heading', { level: 1, name: 'Student opportunities' })).toBeVisible();
    await expect(page.getByText('NSFAS Bursary', { exact: true })).toBeVisible();

    const fields = page.getByRole('region', { name: 'Filter by field of study' });
    await fields.getByRole('button', { name: 'Engineering' }).click();
    await expect(fields.getByRole('button', { name: 'Engineering' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { level: 2, name: /^Engineering/ })).toBeVisible();

    await page.getByRole('tab', { name: /Internships/ }).click();
    await expect(page.getByRole('heading', { level: 2, name: /^Internships/ })).toBeVisible();
    await expect(page.getByText('Software Engineering Internship')).toBeVisible();
  });

  test('internships page filters by type and search', async ({ page }) => {
    await page.goto('/opportunities');
    await expect(page.getByRole('heading', { level: 1, name: 'Internships & graduate programmes' })).toBeVisible();
    await page.getByRole('button', { name: 'Graduate programmes' }).click();
    await expect(page.getByRole('heading', { level: 2, name: /^Graduate programmes/ })).toBeVisible();
    await page.getByLabel('Search opportunities or providers').fill('zzzz-no-match');
    await expect(page.getByText('No opportunities match your filters')).toBeVisible();
  });

  test('unknown pages show the 404 page with ways back', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    await page.getByRole('main').getByRole('link', { name: 'Open the map' }).click();
    await expect(page).toHaveURL(/\/properties\?view=map/);
  });
});
