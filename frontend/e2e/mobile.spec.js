const { test, expect } = require('./fixtures');

test.describe('Mobile', () => {
  test('menu opens with the main links and sign-up call to action', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.getByRole('navigation', { name: 'Mobile' });
    for (const name of ['Find a res', 'Reviews', 'Bursaries', 'Internships']) {
      await expect(menu.getByRole('link', { name, exact: true })).toBeVisible();
    }
    // The map is part of Find a res now, not a separate menu entry.
    await expect(menu.getByRole('link', { name: 'Map', exact: true })).toHaveCount(0);
    await expect(menu.getByRole('link', { name: 'Sign up free' })).toBeVisible();
    await menu.getByRole('link', { name: 'Find a res' }).click();
    await expect(page).toHaveURL(/\/properties$/);
    await expect(menu).toBeHidden();
  });

  test('the map opens full screen with its own campus picker and returns to the list', async ({ page }) => {
    await page.goto('/properties');
    await expect(page.getByTestId('property-card').first()).toBeVisible();
    await expect(page.getByTestId('properties-map')).toHaveCount(0);

    await page.getByRole('button', { name: 'Show map' }).click();
    await expect(page).toHaveURL(/view=map/);
    const layer = page.getByRole('dialog', { name: 'Map of residences' });
    await expect(layer.getByTestId('properties-map')).toBeVisible();
    await expect(layer.getByRole('button', { name: 'Back to the list' })).toBeFocused();
    await expect(page.getByTestId('property-card').first()).toBeHidden();

    // Pick a campus without leaving the map.
    const picker = layer.getByLabel('Distance from campus or college');
    await picker.selectOption('uj-dfc');
    await expect(page).toHaveURL(/near=uj-dfc/);
    await expect(picker).toHaveValue('uj-dfc');
    await expect(layer.locator('.oah-campus.is-active')).toHaveCount(1);

    await layer.getByRole('button', { name: 'Show list' }).click();
    await expect(layer).toBeHidden();
    await expect(page.getByTestId('distance-badge').first()).toContainText('to UJ DFC');
  });

  test('secondary filters fold away behind a Filters button', async ({ page }) => {
    await page.goto('/properties');
    const toggle = page.getByRole('button', { name: /^Filters/ });
    await expect(page.getByLabel('Property type')).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.getByLabel('Property type').selectOption('apartment');
    await expect(page).toHaveURL(/type=apartment/);
    await expect(toggle).toContainText('1');
    await expect(page.getByRole('heading', { level: 2, name: /propert(y|ies) found/ })).not.toHaveText('62 properties found');
  });

  test('the campus picker filters by distance without sideways scrolling', async ({ page }) => {
    await page.goto('/properties');
    await page.getByLabel('Distance from campus or college').selectOption('uj-dfc');
    await expect(page.getByTestId('distance-badge').first()).toContainText('to UJ DFC');
    await expect(page.getByRole('group', { name: 'Maximum distance' })).toBeVisible();
    // No horizontal page scroll on a phone.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('the sign-in page drops the photo panel and fits the screen', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Why oneApplyHub' })).toBeHidden();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
