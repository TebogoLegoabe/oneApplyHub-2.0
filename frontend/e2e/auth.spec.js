const { test, expect, API, STUDENT, login } = require('./fixtures');

test.describe('Accounts', () => {
  test('a student signs in, uses the dashboard and the residence map, then signs out', async ({ page }) => {
    await login(page, STUDENT);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { level: 1, name: `Welcome back, ${STUDENT.firstName}` })).toBeVisible();

    const nav = page.getByRole('navigation', { name: 'Main' });
    await nav.getByRole('link', { name: 'Residence map' }).click();
    await expect(page).toHaveURL(/\/properties\?view=map/);
    await expect(nav.getByRole('link', { name: 'Residence map' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('properties-map')).toBeVisible();

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
