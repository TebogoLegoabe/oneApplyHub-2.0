const AxeBuilder = require('@axe-core/playwright').default;
const { test, expect, API } = require('./fixtures');

/**
 * Automated WCAG 2.1 A/AA checks with axe-core. Leaflet's tile and marker panes are
 * excluded: they are third-party map internals (the map itself is labelled and every
 * residence is also reachable from the list).
 */
const scan = async (page) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('.leaflet-pane')
    .analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
  const summary = serious.map((violation) => `${violation.id} (${violation.impact}): ${violation.nodes.slice(0, 3).map((node) => node.target.join(' ')).join(' | ')}`);
  expect(summary, summary.join('\n')).toEqual([]);
};

const propertyId = async (request, name) => {
  const response = await request.get(`${API}/properties`, { params: { search: name } });
  return (await response.json()).properties.find((property) => property.name === name).id;
};

test.describe('Accessibility (axe-core, WCAG 2.1 AA)', () => {
  for (const [name, path] of [
    ['home', '/'],
    ['properties', '/properties'],
    ['reviews', '/reviews'],
    ['bursaries', '/bursaries'],
    ['login', '/login'],
    ['register', '/register'],
    ['404', '/nope'],
  ]) {
    test(`${name} page has no serious violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1').first()).toBeVisible();
      await page.waitForLoadState('networkidle');
      await scan(page);
    });
  }

  test('property detail page has no serious violations', async ({ page, request }) => {
    await page.goto(`/properties/${await propertyId(request, 'Braamfontein Gate')}`);
    await expect(page.getByTestId('campus-row').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    await scan(page);
  });

  test('dark mode home page has no serious violations', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.waitForLoadState('networkidle');
    await scan(page);
  });
});
