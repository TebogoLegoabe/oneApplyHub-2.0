const { test, expect, cardDistances } = require('./fixtures');

test.describe('Home page', () => {
  test('shows the hero, live stats, campus explorer and featured residences', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /find a res that's close to campus/i })).toBeVisible();
    // Numbers come from the seeded API: 51 approved properties, 4 approved reviews.
    const stats = page.getByRole('region', { name: 'Platform statistics' });
    await expect(stats.getByText('51+')).toBeVisible();
    await expect(stats.getByText('4', { exact: true })).toBeVisible();

    const explorer = page.getByRole('region', { name: /pick your campus/i });
    const wits = explorer.getByRole('link', { name: /Wits Main Campus/ });
    await expect(wits).toContainText(/\d+ residences? within 2 km/);
    await expect(wits).toContainText(/Closest: \d+ min walk/);
    await expect(explorer.getByRole('link', { name: /UJ Doornfontein/ })).toHaveAttribute('href', '/properties?near=uj-dfc&university=uj&sort=distance');

    const featured = page.getByRole('region', { name: 'Top-rated accommodation' });
    await expect(featured.getByTestId('property-card')).toHaveCount(6);
    // Highest-rated seeded residence (5 + 4 stars) leads the list.
    await expect(featured.getByTestId('property-card').first()).toContainText('Braamfontein Gate');
    await expect(featured.getByTestId('distance-badge').first()).toContainText(/min (walk|drive)/);
  });

  test('hero search by campus opens residences nearest first', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Your campus', { exact: true }).selectOption('uj-apk');
    await page.getByRole('button', { name: /find my res/i }).click();

    await expect(page).toHaveURL(/\/properties\?.*near=uj-apk/);
    await expect(page).toHaveURL(/sort=distance/);
    await expect(page.getByTestId('distance-badge').first()).toContainText('to UJ APK');
    const distances = await cardDistances(page);
    expect(distances.length).toBeGreaterThan(0);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  test('map preview shows residence pins on OpenStreetMap tiles', async ({ page }) => {
    await page.goto('/');
    const map = page.getByTestId('properties-map').first();
    await expect(map.locator('.oah-pin, .oah-cluster').first()).toBeVisible();
    await expect(page.getByText('50 residences on the map')).toBeVisible();
    await expect(map.locator('.oah-campus').first()).toBeVisible();
    await expect(map.getByRole('link', { name: 'OpenStreetMap' })).toBeVisible();
    expect(page.external.tiles).toBeGreaterThan(0);

    await page.getByRole('link', { name: 'Explore the map' }).click();
    await expect(page).toHaveURL(/\/properties\?view=map/);
  });

  test('announcement bar can be dismissed and stays dismissed', async ({ page }) => {
    await page.goto('/');
    const announcement = page.getByText(/See the walking time from every residence/);
    await expect(announcement).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss announcement' }).click();
    await expect(announcement).toBeHidden();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(announcement).toBeHidden();
  });

  test('dark mode toggle persists across reloads', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
