// @ts-check
/**
 * End-to-end tests against the real stack: Flask API (fresh seeded SQLite) + the
 * production React build. External services (OSM tiles, routing, geocoding, fonts,
 * hot-linked photos) are intercepted in e2e/fixtures.js so runs are deterministic.
 *
 *   npm run e2e          # build the e2e bundle, then run every test
 *   npm run e2e:test     # run tests against an existing e2e build
 */
const fs = require('fs');
const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

const API_PORT = 5001;
const WEB_PORT = 3100;
const backendDir = path.resolve(__dirname, '..', 'backend');
const venvPython = [path.join(backendDir, 'venv', 'Scripts', 'python.exe'), path.join(backendDir, 'venv', 'bin', 'python')].find((candidate) => fs.existsSync(candidate));
const python = process.env.E2E_PYTHON || venvPython || 'python';
// Set E2E_CHANNEL=chrome to use an installed Google Chrome instead of downloading Playwright's Chromium.
const channel = process.env.E2E_CHANNEL || undefined;

module.exports = defineConfig({
  testDir: './e2e',
  // One shared API + database: run serially so tests never race each other's writes.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]],
  outputDir: 'e2e-results',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'en-ZA',
    timezoneId: 'Africa/Johannesburg',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /mobile\.spec\.js/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, channel },
    },
    {
      name: 'mobile',
      testMatch: /mobile\.spec\.js/,
      use: { ...devices['Pixel 7'], channel },
    },
  ],
  webServer: [
    {
      command: `"${python}" e2e_server.py`,
      cwd: backendDir,
      url: `http://127.0.0.1:${API_PORT}/api/health`,
      env: { E2E_PORT: String(API_PORT), E2E_FRONTEND_URL: `http://localhost:${WEB_PORT}` },
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'node e2e/static-server.js',
      url: `http://localhost:${WEB_PORT}`,
      env: { E2E_WEB_PORT: String(WEB_PORT) },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
