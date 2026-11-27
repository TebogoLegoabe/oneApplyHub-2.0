const { test, expect, API } = require('./fixtures');

const propertyId = async (request, name) => {
  const response = await request.get(`${API}/properties`, { params: { search: name, per_page: 50 } });
  const { properties } = await response.json();
  const match = properties.find((property) => property.name === name);
  if (!match) throw new Error(`No seeded property named ${name}`);
  return match.id;
};

test.describe('Property detail — how far is it?', () => {
  test('lists every campus nearest first and draws the exact walking route', async ({ page, request }) => {
    await page.goto(`/properties/${await propertyId(request, 'Braamfontein Gate')}`);
    await expect(page.getByRole('heading', { level: 1, name: 'Braamfontein Gate' })).toBeVisible();

    const section = page.getByRole('region', { name: 'How far is it from campus?' });
    const rows = section.getByTestId('campus-row');
    // Serves both universities, so all seven campuses are listed — Wits Main is closest.
    await expect(rows).toHaveCount(7);
    await expect(rows.first()).toContainText('Wits Main Campus');
    await expect(rows.first()).toContainText(/\d+ min/);

    const map = section.getByTestId('property-location-map');
    await expect(map.locator('.oah-home')).toBeVisible();
    await expect(map.locator('.oah-campus')).toHaveCount(7);

    await rows.first().getByRole('button', { name: 'Exact walking route' }).click();
    await expect(rows.first().getByTestId('route-result')).toContainText(/Walking route: [\d.]+ (km|m) · \d+ min/);
    await expect(map.locator('path.leaflet-interactive')).toHaveCount(2); // white casing + blue route
    expect(page.external.routes).toBe(1);

    await expect(rows.first().getByRole('link', { name: /Directions/ })).toHaveAttribute('href', /openstreetmap\.org\/directions\?engine=fossgis_osrm_foot&route=/);

    await section.getByRole('button', { name: 'UJ campuses' }).click();
    await expect(rows).toHaveCount(4);
    for (const text of await rows.allInnerTexts()) expect(text).toMatch(/^UJ /);
  });

  test('quick distance badges and amenities show in the summary', async ({ page, request }) => {
    await page.goto(`/properties/${await propertyId(request, 'Campus Africa - Rennie House')}`);
    const summary = page.getByLabel('Distance to nearest campuses');
    await expect(summary.getByTestId('distance-badge').first()).toContainText(/to Wits (Main|Education|Medical)/);
    await expect(page.getByRole('heading', { name: 'Amenities & features' })).toBeVisible();
    await expect(page.getByText('Building (OpenStreetMap)')).toBeVisible();
  });

  test('street-level pins are flagged as approximate', async ({ page, request }) => {
    await page.goto(`/properties/${await propertyId(request, 'Nota Bene')}`);
    await expect(page.getByText(/The pin is placed on the street, not the exact building/)).toBeVisible();
    await expect(page.getByText('Approximate (street level)')).toBeVisible();
  });

  test('a residence without a pin explains the location is coming', async ({ page, request }) => {
    await page.goto(`/properties/${await propertyId(request, 'Student Digz - Skyways')}`);
    await expect(page.getByText('Map location coming soon')).toBeVisible();
    await expect(page.getByTestId('property-location-map')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Search the address/ })).toHaveAttribute('href', /openstreetmap\.org\/search\?query=12%20Sutherland/);
  });

  test('nearby residences are listed with distances and link to each other', async ({ page, request }) => {
    await page.goto(`/properties/${await propertyId(request, 'Braamfontein Gate')}`);
    const nearby = page.getByRole('region', { name: 'Other residences close by' });
    const cards = nearby.getByTestId('nearby-card');
    await expect(cards).toHaveCount(6);
    await expect(cards.first()).toContainText(/away · \d+ min walk/);
    const name = (await cards.first().locator('p').first().innerText()).trim();
    await cards.first().click();
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  });

  test('reviews show and helpful votes ask signed-out visitors to sign in', async ({ page, request }) => {
    await page.goto(`/properties/${await propertyId(request, 'Braamfontein Gate')}`);
    const reviews = page.getByRole('region', { name: 'Student reviews' });
    await expect(reviews.getByText(/Five minutes to class/)).toBeVisible();
    await reviews.getByRole('button', { name: /^Helpful · \d+/ }).first().click();
    await expect(page.getByText('Sign in to mark reviews as helpful.')).toBeVisible();
  });

  test('contact details can be copied', async ({ page, request, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(`/properties/${await propertyId(request, 'Braamfontein Gate')}`);
    await page.getByRole('button', { name: 'Copy contact' }).click();
    await expect(page.getByText('Contact details copied to clipboard.')).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain('Smit Street');
  });

  test('an unknown property shows a friendly not-found state', async ({ page }) => {
    await page.goto('/properties/999999');
    await expect(page.getByText('Property not found')).toBeVisible();
    await page.getByRole('link', { name: 'Back to properties' }).click();
    await expect(page).toHaveURL(/\/properties$/);
  });
});
