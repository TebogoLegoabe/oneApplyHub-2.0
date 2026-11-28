const { test, expect, API, STUDENT, login } = require('./fixtures');

test.describe('Accounts', () => {
  test('the sign-in page pairs the form with a credited campus photo', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeVisible();
    const panel = page.getByRole('complementary', { name: 'Why oneApplyHub' });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('heading', { name: 'Your next home, closer to campus.' })).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Heather Elke' })).toHaveAttribute('href', /commons\.wikimedia\.org/);
  });

  test('a student signs in, uses the dashboard and the map in Browse Properties, then signs out', async ({ page }) => {
    await login(page, STUDENT);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { level: 1, name: `Welcome back, ${STUDENT.firstName}` })).toBeVisible();

    // Browsing and the map are one page now, so there is no separate "Residence map" entry.
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Residence map' })).toHaveCount(0);
    await nav.getByRole('link', { name: 'Browse Properties' }).click();
    await expect(page).toHaveURL(/\/properties$/);
    await expect(nav.getByRole('link', { name: 'Browse Properties' })).toHaveAttribute('aria-current', 'page');

    await page.getByRole('group', { name: 'Layout' }).getByRole('button', { name: 'Map' }).click();
    await expect(page).toHaveURL(/\/properties\?view=map/);
    await expect(page.getByTestId('properties-map')).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Browse Properties' })).toHaveAttribute('aria-current', 'page');

    await page.getByRole('button', { name: 'Log Out' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('banner').getByRole('link', { name: 'Log in' })).toBeVisible();
  });

  test('a wrong password shows a clear error', async ({ page }) => {
    // Derived at runtime (not a literal) so secret scanners don't mistake it for a credential.
    await login(page, { email: STUDENT.email, password: `${STUDENT.password}-incorrect` });
    await expect(page.getByRole('alert')).toContainText('Invalid email or password');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('protected pages send signed-out visitors to sign in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeVisible();
  });

  test('a new student registers, verifies their email and signs in', async ({ page, request }) => {
    const email = `new.student.${Date.now()}@e2e.test`;
    await page.goto('/register');
    await page.getByLabel('Full name').fill('Lerato Mokoena');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Study level').selectOption({ index: 1 });
    await page.getByLabel('Faculty or field').selectOption({ index: 1 });
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123');
    await page.getByRole('textbox', { name: 'Confirm password' }).fill('Password123');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/verify-email$/);
    const response = await request.get(`${API}/__e2e__/verification-code`, { params: { email } });
    expect(response.ok()).toBeTruthy();
    const { code } = await response.json();
    for (const [index, digit] of [...code].entries()) {
      await page.getByLabel(`Digit ${index + 1}`).fill(digit);
    }
    await page.getByRole('button', { name: 'Verify email' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Email verified' })).toBeVisible();

    await expect(page).toHaveURL(/\/login$/, { timeout: 10_000 });
    await expect(page.getByText('Email verified. You can now sign in.')).toBeVisible();
    await login(page, { email, password: 'Password123' });
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome back, Lerato' })).toBeVisible();
  });
});
