const { test, expect, cardDistances } = require('./fixtures');

const resultHeading = (page) => page.getByRole('heading', { level: 2, name: /propert(y|ies) found|Loading properties/ });

test.describe('Find accommodation — list and filters', () => {
  test('lists every approved residence with pagination', async ({ page }) => {
    await page.goto('/properties?view=list');
    await expect(resultHeading(page)).toHaveText('51 properties found');
    await expect(page.getByTestId('property-card')).toHaveCount(12);

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText('Page 2 of 5', { exact: true })).toBeVisible();
    await expect(page.getByTestId('property-card')).toHaveCount(12);
  });

  test('search narrows results and is kept in the URL', async ({ page }) => {
    await page.goto('/properties?view=list');
    await page.getByLabel('Search by name or location').fill('Juta');
    await expect(page).toHaveURL(/search=Juta/);
    await expect(resultHeading(page)).toHaveText(/^\d+ propert(y|ies) found$/);
    await expect(resultHeading(page)).not.toHaveText('51 properties found');
    for (const text of await page.getByTestId('property-card').allInnerTexts()) expect(text).toMatch(/juta/i);

    // Removable filter pill clears it again.
    await page.getByRole('button', { name: /Remove filter: “Juta”/ }).click();
    await expect(resultHeading(page)).toHaveText('51 properties found');
  });

  test('distance from a campus sorts nearest first and the radius limits results', async ({ page }) => {
    await page.goto('/properties?view=list');
    await page.getByRole('button', { name: 'Wits Main', exact: true }).click();
    await expect(page).toHaveURL(/near=wits-main/);
    await expect(page.getByTestId('distance-badge').first()).toContainText('to Wits Main');
    let distances = await cardDistances(page);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
    expect(distances[0]).toBeLessThan(0.5);

    await page.getByRole('button', { name: '1 km', exact: true }).click();
    await expect(resultHeading(page)).toHaveText(/found within 1 km of Wits Main Campus/);
    distances = await cardDistances(page);
    expect(Math.max(...distances)).toBeLessThanOrEqual(1);

    await page.getByRole('button', { name: 'Remove filter: Within 1 km' }).click();
    await expect(page).not.toHaveURL(/max_km/);
    await page.getByRole('button', { name: 'Wits Main', exact: true }).click(); // toggles off
    await expect(page).not.toHaveURL(/near=/);
  });

  test('sorting by price works both ways', async ({ page }) => {
    await page.goto('/properties?view=list');
    const prices = async () => (await page.getByTestId('property-card').allInnerTexts())
      .map((text) => Number((text.match(/R(\d[\d\s ]*)/) || [])[1]?.replace(/\D/g, '')));

    await page.getByLabel('Sort by').selectOption('price_asc');
    await expect(page).toHaveURL(/sort=price_asc/);
    await expect(page.getByTestId('property-card').first()).toContainText('R2'); // cheapest seed starts at R2 500
    const ascending = await prices();
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));

    await page.getByLabel('Sort by').selectOption('price_desc');
    await expect(page).toHaveURL(/sort=price_desc/);
    await expect(page.getByTestId('property-card').first()).not.toContainText('R2 500');
  });

  test('NSFAS filter shows only accredited residences', async ({ page }) => {
    await page.goto('/properties?view=list');
    await page.getByRole('button', { name: 'NSFAS only' }).click();
    await expect(page).toHaveURL(/nsfas=1/);
    await expect(resultHeading(page)).toHaveText('2 properties found');
    const cards = page.getByTestId('property-card');
    await expect(cards).toHaveCount(2);
    for (const card of await cards.all()) await expect(card.getByText('NSFAS', { exact: true })).toBeVisible();
  });

  test('empty results offer to clear filters', async ({ page }) => {
    await page.goto('/properties?view=list&max_price=100');
    await expect(page.getByText('No properties match your filters')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).last().click();
    await expect(resultHeading(page)).toHaveText('51 properties found');
  });
});

test.describe('Find accommodation — map', () => {
  test('split view shows clustered pins and campus markers', async ({ page }) => {
    await page.goto('/properties');
    const map = page.getByTestId('properties-map');
    await expect(map).toBeVisible();
    await expect(map.locator('.oah-pin, .oah-cluster').first()).toBeVisible();
    await expect(map.locator('.oah-campus')).toHaveCount(7);
    await expect(map.getByText(/1 without a map pin yet/)).toBeVisible();
  });

  test('residences sharing a street-level pin spiderfy apart instead of stacking', async ({ page }) => {
    // All five Juta Street residences were geocoded to the same street midpoint.
    await page.goto('/properties?search=Juta');
    await expect(resultHeading(page)).toHaveText('5 properties found');
    const map = page.getByTestId('properties-map');
    const cluster = map.locator('.oah-cluster');
    await expect(cluster).toHaveCount(1);
    await expect(cluster).toHaveText('5');
    await cluster.click();
    await expect(map.locator('.oah-pin')).toHaveCount(5);
    await map.locator('.oah-pin').first().click();
    await expect(page.getByTestId('map-preview-card')).toContainText(/Juta|Nota Bene|Blackburn|Argon/);
  });

  test('a pin opens a preview card that links to the residence', async ({ page }) => {
    await page.goto('/properties?search=Relytant');
    const pin = page.getByTestId('properties-map').locator('.oah-pin');
    await expect(pin).toHaveCount(1);
    await pin.click();
    const preview = page.getByTestId('map-preview-card');
    await expect(preview).toContainText('South Point - Relytant');
    await expect(preview).toContainText(/R5[\s ]260/);
    await preview.getByRole('link', { name: 'View' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'South Point - Relytant' })).toBeVisible();
  });

  test('hovering a card highlights its pin', async ({ page }) => {
    await page.goto('/properties?search=Relytant');
    const pin = page.getByTestId('properties-map').locator('.oah-pin');
    await expect(pin).toHaveCount(1);
    await page.getByTestId('property-card').hover();
    await expect(pin).toHaveClass(/is-active/);
    await page.mouse.move(5, 5);
    await expect(pin).not.toHaveClass(/is-active/);
  });

  test('layout toggle switches between list, split and map views', async ({ page }) => {
    await page.goto('/properties');
    const layout = page.getByRole('group', { name: 'Layout' });
    await layout.getByRole('button', { name: 'List' }).click();
    await expect(page).toHaveURL(/view=list/);
    await expect(page.getByTestId('properties-map')).toHaveCount(0);
    await layout.getByRole('button', { name: 'Map' }).click();
    await expect(page).toHaveURL(/view=map/);
    await expect(page.getByTestId('properties-map')).toBeVisible();
    await layout.getByRole('button', { name: 'Split' }).click();
    await expect(page).not.toHaveURL(/view=/);
    await expect(page.getByTestId('properties-map')).toBeVisible();
  });
});

test.describe('Near me', () => {
  test.use({ geolocation: { latitude: -26.1946, longitude: 28.0348 }, permissions: ['geolocation'] });

  test('sorts by distance from the student without putting their location in the URL', async ({ page }) => {
    await page.goto('/properties?view=list');
    const request = page.waitForRequest((req) => req.url().includes('/api/properties?') && req.url().includes('near_lat=-26.1946'));
    await page.getByRole('button', { name: /near me/i }).click();
    await request;
    await expect(page).toHaveURL(/near=me/);
    await expect(page.getByTestId('distance-badge').first()).toContainText('to you');
    const distances = await cardDistances(page);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
    expect(page.url()).not.toContain('-26.19');
  });
});
