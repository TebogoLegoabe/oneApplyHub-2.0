const { test, expect, cardDistances } = require('./fixtures');

test.describe('Home page', () => {
  test('shows the hero, live stats, campus explorer and featured residences', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /find a res that's close to campus/i })).toBeVisible();
    // Numbers come from the seeded API: 62 approved properties, 4 approved reviews.
    const stats = page.getByRole('region', { name: 'Platform statistics' });
    await expect(stats.getByText('62+')).toBeVisible();
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

  test('the campus explorer also covers Braamfontein colleges', async ({ page }) => {
    await page.goto('/');
    const explorer = page.getByRole('region', { name: /pick your campus/i });
    await explorer.getByRole('group', { name: 'Campus type' }).getByRole('button', { name: 'Colleges' }).click();
    const college = explorer.getByRole('link', { name: /IIE Rosebank College Braamfontein/ });
    await expect(college).toContainText(/\d+ residences? within 2 km/);
    await expect(college).toContainText(/Closest: \d+ min walk/);
    // Colleges serve every student, so the link has no university filter.
    await expect(college).toHaveAttribute('href', '/properties?near=rosebank-college&sort=distance');
    await expect(explorer.getByRole('link', { name: /Wits Main Campus/ })).toHaveCount(0);
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

  test('hero photos load and credit their photographers', async ({ page }) => {
    await page.goto('/');
    const bridge = page.getByRole('img', { name: /Nelson Mandela Bridge, which links Braamfontein/ });
    await expect(bridge).toBeVisible();
    await expect.poll(() => bridge.evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(100);

    // Creative Commons attribution: photographer linked to the source, licence linked to its deed.
    await expect(page.getByRole('link', { name: 'Chante Schatz' })).toHaveAttribute('href', /commons\.wikimedia\.org\/wiki\/File:Great_Hall/);
    await expect(page.getByRole('link', { name: 'CC BY-SA 4.0' }).first()).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0/');

    // The walking-time card over the photos uses the seeded map data.
    await expect(page.getByText('Closest to Wits Main')).toBeVisible();
  });

  test('the home page no longer loads a map (it lives on Find a res)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('properties-map')).toHaveCount(0);
    expect(page.external.tiles).toBe(0);
  });

  test('announcement bar can be dismissed and stays dismissed', async ({ page }) => {
    await page.goto('/');
    const announcement = page.getByText(/Walking times from every residence to Wits, UJ and Braamfontein colleges/);
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
