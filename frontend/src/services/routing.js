/**
 * Real walking routes from an OSRM server.
 *
 * Defaults to the free FOSSGIS server behind openstreetmap.org's directions
 * (https://routing.openstreetmap.de). Its policy allows light use only — max one
 * request per second, no heavy usage — so routes are fetched on demand (a click),
 * never on page load, and cached. For high traffic, point REACT_APP_ROUTING_URL at
 * your own OSRM instance, or set it to an empty string to turn the feature off
 * (the UI then falls back to calibrated estimates and an OpenStreetMap link).
 */
const DEFAULT_ROUTING_URL = 'https://routing.openstreetmap.de/routed-foot';
const configured = process.env.REACT_APP_ROUTING_URL;
const ROUTING_URL = (configured === undefined ? DEFAULT_ROUTING_URL : configured).replace(/\/$/, '');

export const routingEnabled = Boolean(ROUTING_URL);
export const ROUTING_ATTRIBUTION = 'Route: OSRM / FOSSGIS, © OpenStreetMap contributors';

const cache = new Map();
let lastRequestAt = 0;

const key = (from, to) => [from.lat, from.lng, to.lat, to.lng].map((value) => Number(value).toFixed(5)).join(',');

/**
 * @returns {Promise<{distanceKm: number, durationMin: number, coordinates: [number, number][]}>}
 */
export async function fetchWalkingRoute(from, to, { signal } = {}) {
  if (!routingEnabled) throw new Error('Routing is disabled');
  const cacheKey = key(from, to);
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // Respect the one-request-per-second policy even if someone clicks quickly.
  const wait = 1000 - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();

  // OSRM ignores the profile segment; the server URL picks the profile (routed-foot).
  const url = `${ROUTING_URL}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&alternatives=false&steps=false`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Routing failed (${response.status})`);
  const data = await response.json();
  const route = data?.routes?.[0];
  if (data?.code !== 'Ok' || !route) throw new Error('No walking route found');

  const result = {
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
    coordinates: (route.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]),
  };
  cache.set(cacheKey, result);
  return result;
}
