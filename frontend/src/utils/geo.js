import { CAMPUSES, campusesFor } from '../constants/campuses';

const EARTH_RADIUS_KM = 6371.0088;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * Walking routes are longer than the straight line between two points. These were
 * calibrated against real OpenStreetMap walking routes from residences to campuses
 * (Braamfontein, Parktown, Auckland Park, Doornfontein): routes averaged 1.41x the
 * straight-line distance at 4.5 km/h.
 */
export const ROUTE_FACTOR = 1.4;
export const SPEEDS_KMH = { walk: 4.5, cycle: 13, drive: 22 };
const DRIVE_OVERHEAD_MIN = 2; // parking, traffic lights

export const hasCoords = (place) =>
  place != null
  && place.latitude != null && place.longitude != null
  && Number.isFinite(Number(place.latitude)) && Number.isFinite(Number(place.longitude));

/** Normalise {latitude, longitude} or {lat, lng} to {lat, lng}. */
export const toPoint = (place) => ({
  lat: Number(place.lat ?? place.latitude),
  lng: Number(place.lng ?? place.longitude),
});

/** Great-circle ("as the crow flies") distance in kilometres. */
export const haversineKm = (from, to) => {
  const a = toPoint(from);
  const b = toPoint(to);
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
};

/** Estimated route distance and travel times for a straight-line distance. */
export const estimateTravel = (straightKm) => {
  const routeKm = straightKm * ROUTE_FACTOR;
  return {
    straightKm,
    routeKm,
    walkMin: Math.max(1, Math.round((routeKm / SPEEDS_KMH.walk) * 60)),
    cycleMin: Math.max(1, Math.round((routeKm / SPEEDS_KMH.cycle) * 60)),
    driveMin: Math.max(1, Math.round((routeKm / SPEEDS_KMH.drive) * 60 + DRIVE_OVERHEAD_MIN)),
  };
};

export const formatDistance = (km) => {
  if (km == null || !Number.isFinite(km)) return '—';
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
};

export const formatMinutes = (minutes) => {
  if (minutes == null || !Number.isFinite(minutes)) return '—';
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
};

/** Walkability band used for badge colours: easy (<=15 min), ok (<=30 min), far. */
export const walkBand = (walkMin) => {
  if (walkMin == null) return 'unknown';
  if (walkMin <= 15) return 'easy';
  if (walkMin <= 30) return 'ok';
  return 'far';
};

/** Every campus with distance and travel estimates from a place, nearest first. */
export const distancesToCampuses = (place, campuses = CAMPUSES) => {
  if (!hasCoords(place)) return [];
  return campuses
    .map((campus) => ({ campus, ...estimateTravel(haversineKm(place, campus)) }))
    .sort((a, b) => a.straightKm - b.straightKm);
};

/** Nearest campus of the property's own university (all campuses for 'both'). */
export const nearestCampus = (property) => distancesToCampuses(property, campusesFor(property?.university))[0] || null;

/**
 * The distance to show on a property card: from the selected origin (campus or the
 * student's location) when there is one, otherwise to the nearest relevant campus.
 */
export const travelFrom = (property, origin) => {
  if (!hasCoords(property)) return null;
  if (origin) {
    const straightKm = Number.isFinite(property.distance_km) ? property.distance_km : haversineKm(property, origin);
    return { ...estimateTravel(straightKm), label: origin.short || origin.label };
  }
  const nearest = nearestCampus(property);
  return nearest ? { ...nearest, label: nearest.campus.short } : null;
};

const OSM_ENGINES = { foot: 'fossgis_osrm_foot', bicycle: 'fossgis_osrm_bike', car: 'fossgis_osrm_car' };

/** Turn-by-turn directions on openstreetmap.org. */
export const osmDirectionsUrl = (from, to, mode = 'foot') => {
  const a = toPoint(from);
  const b = toPoint(to);
  const route = `${a.lat.toFixed(6)},${a.lng.toFixed(6)};${b.lat.toFixed(6)},${b.lng.toFixed(6)}`;
  return `https://www.openstreetmap.org/directions?engine=${OSM_ENGINES[mode] || OSM_ENGINES.foot}&route=${encodeURIComponent(route)}`;
};

/** A place on openstreetmap.org with a marker. */
export const osmViewUrl = (place, zoom = 18) => {
  const { lat, lng } = toPoint(place);
  return `https://www.openstreetmap.org/?mlat=${lat.toFixed(6)}&mlon=${lng.toFixed(6)}#map=${zoom}/${lat.toFixed(6)}/${lng.toFixed(6)}`;
};
