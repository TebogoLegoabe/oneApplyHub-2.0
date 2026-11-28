const { test, expect, ADMIN, login } = require('./fixtures');

test.describe('Admin — pin a residence on the map', () => {
  test('an admin places the missing pin, students see distances, then the pin is removed', async ({ page }) => {
    await login(page, ADMIN);
    await expect(page).toHaveURL(/\/admin$/);
    await page.getByRole('button', { name: /^Properties/ }).click();

    // Seed data: Skyways plus the two Campus Central residences still need pins.
    await expect(page.getByText('3 without a map pin')).toBeVisible();
    const row = page.getByRole('row', { name: /Student Digz - Skyways/ });
    await expect(row.getByText('No pin')).toBeVisible();
    await row.getByRole('button', { name: 'Set map location for Student Digz - Skyways' }).click();

    const dialog = page.getByRole('dialog', { name: /Location · Student Digz - Skyways/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Save location' })).toBeDisabled();

    // Search the address (OpenStreetMap Nominatim, answered by the test fixture) and pick the result.
    await dialog.getByRole('button', { name: 'Find' }).click();
    await dialog.getByRole('button', { name: /12 Sutherland Avenue, Braamfontein/ }).click();
    await expect(dialog.getByLabel('Latitude')).toHaveValue('-26.1952');
    await expect(dialog.getByLabel('Longitude')).toHaveValue('28.0371');

    // Fine-tune by clicking the map: the coordinates update.
    const map = dialog.locator('.oah-map');
    await map.click({ position: { x: 120, y: 90 } });
    await expect(dialog.getByLabel('Latitude')).not.toHaveValue('-26.1952');
    await dialog.getByLabel('Latitude').fill('-26.1953');
    await dialog.getByLabel('Longitude').fill('28.0372');

    await dialog.getByRole('button', { name: 'Save location' }).click();
    await expect(page.getByText('Location saved for Student Digz - Skyways.')).toBeVisible();
    await expect(dialog).toBeHidden();
    await expect(row.getByText('Exact')).toBeVisible();
    await expect(page.getByText('2 without a map pin')).toBeVisible();

    // The public page now shows distances to campus.
    await page.goto('/properties?search=Skyways');
    await page.getByRole('link', { name: 'Student Digz - Skyways' }).click();
    await expect(page.getByTestId('campus-row').first()).toBeVisible();
    await expect(page.getByText('Exact (set by our team)')).toBeVisible();

    // Clean up: remove the pin again so the suite is repeatable.
    await page.goto('/admin');
    await page.getByRole('button', { name: /^Properties/ }).click();
    await page.getByRole('row', { name: /Student Digz - Skyways/ }).getByRole('button', { name: /Set map location/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Remove pin' }).click();
    await expect(page.getByText('Map pin removed for Student Digz - Skyways.')).toBeVisible();
    await expect(page.getByRole('row', { name: /Student Digz - Skyways/ }).getByText('No pin')).toBeVisible();
    await expect(page.getByText('3 without a map pin')).toBeVisible();
  });

  test('impossible coordinates cannot be saved', async ({ page }) => {
    await login(page, ADMIN);
    await page.getByRole('button', { name: /^Properties/ }).click();
    await page.getByRole('row', { name: /Student Digz - Skyways/ }).getByRole('button', { name: /Set map location/ }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Latitude').fill('95');
    await dialog.getByLabel('Longitude').fill('28.03');
    // Client-side guard: an impossible latitude keeps Save disabled.
    await expect(dialog.getByRole('button', { name: 'Save location' })).toBeDisabled();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
  });
});
