/* Shared Playwright fixtures: network isolation, test accounts, and small helpers. */
const base = require('@playwright/test');

const { expect } = base;

const APP_ORIGIN = 'http://localhost:3100';
const API_ORIGIN = 'http://localhost:5001';
const API = `${API_ORIGIN}/api`;

const STUDENT = { email: 'thandi@e2e.test', password: 'Password123', firstName: 'Thandi' };
const ADMIN = { email: 'admin@e2e.test', password: 'Password123' };

// 1x1 PNG used for map tiles and hot-linked property photos.
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

const haversineMetres = (a, b) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
};

/** Fake OSRM walking route: an L-shaped path, 1.5x the straight line, at 4.5 km/h. */
const fakeRoute = (url) => {
  const match = url.match(/\/route\/v1\/[^/]+\/(-?[\d.]+),(-?[\d.]+);(-?[\d.]+),(-?[\d.]+)/);
  if (!match) return { code: 'InvalidUrl', routes: [] };
  const [fromLng, fromLat, toLng, toLat] = match.slice(1).map(Number);
  const distance = haversineMetres({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng }) * 1.5;
  return {
    code: 'Ok',
    routes: [{
      distance,
      duration: distance / 1.25,
      geometry: { type: 'LineString', coordinates: [[fromLng, fromLat], [toLng, fromLat], [toLng, toLat]] },
    }],
  };
};

const NOMINATIM_RESULT = [{
  place_id: 1,
  lat: '-26.1952',
  lon: '28.0371',
  display_name: '12 Sutherland Avenue, Braamfontein, Johannesburg, Gauteng, South Africa',
}];

const test = base.test.extend({
  /** Every request leaving the app is answered locally; only our web app and API hit the network. */
  page: async ({ page }, use) => {
    const external = { tiles: 0, routes: 0, geocodes: 0 };
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      if (url.startsWith(APP_ORIGIN) || url.startsWith(API_ORIGIN) || url.startsWith('http://127.0.0.1:5001') || url.startsWith('data:')) {
        return route.continue();
      }
      if (url.includes('tile.openstreetmap.org')) {
        external.tiles += 1;
        return route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL });
      }
      if (url.includes('routing.openstreetmap.de')) {
        external.routes += 1;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fakeRoute(url)) });
      }
      if (url.includes('nominatim.openstreetmap.org')) {
        external.geocodes += 1;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(NOMINATIM_RESULT) });
      }
      if (url.includes('fonts.googleapis.com')) return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
      if (url.includes('accounts.google.com')) return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
      if (route.request().resourceType() === 'image') return route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL });
      return route.abort();
    });
    page.external = external;
    await use(page);
  },
});

/** Log in through the real form. */
const login = async (page, { email, password }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
};

/** "650 m" / "1.2 km" -> kilometres. */
const parseKm = (text) => {
  const match = text.match(/([\d.]+)\s*(km|m)\b/);
  if (!match) return null;
  const value = Number(match[1]);
  return match[2] === 'km' ? value : value / 1000;
};

/** Distances (km) shown on the property cards currently on screen, in order. */
const cardDistances = async (page) => {
  const badges = await page.getByTestId('property-card').getByTestId('distance-badge').allInnerTexts();
  return badges.map((text) => parseKm(text.split('·')[1] || ''));
};

module.exports = { test, expect, API, STUDENT, ADMIN, login, parseKm, cardDistances };
