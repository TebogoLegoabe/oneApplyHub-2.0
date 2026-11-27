/**
 * Campus reference points used for "how far is it?" distances and map markers.
 * Coordinates come from OpenStreetMap (Nominatim) — each is a central, well-known
 * point on that campus (e.g. the Great Hall for Wits Main).
 */
export const CAMPUSES = [
  { id: 'wits-main', university: 'wits', name: 'Wits Main Campus', short: 'Wits Main', area: 'Braamfontein', lat: -26.192082, lng: 28.030373 },
  { id: 'wits-education', university: 'wits', name: 'Wits Education Campus', short: 'Wits Education', area: 'Parktown', lat: -26.18076, lng: 28.039886 },
  { id: 'wits-medical', university: 'wits', name: 'Wits Health Sciences', short: 'Wits Medical', area: 'Parktown', lat: -26.176754, lng: 28.04446 },
  { id: 'uj-apk', university: 'uj', name: 'UJ Auckland Park Kingsway', short: 'UJ APK', area: 'Auckland Park', lat: -26.18532, lng: 27.997183 },
  { id: 'uj-apb', university: 'uj', name: 'UJ Bunting Road', short: 'UJ APB', area: 'Cottesloe', lat: -26.188538, lng: 28.015207 },
  { id: 'uj-dfc', university: 'uj', name: 'UJ Doornfontein', short: 'UJ DFC', area: 'Doornfontein', lat: -26.193816, lng: 28.05599 },
  { id: 'uj-swc', university: 'uj', name: 'UJ Soweto', short: 'UJ Soweto', area: 'Soweto', lat: -26.261232, lng: 27.922167 },
];

export const CAMPUS_BY_ID = Object.fromEntries(CAMPUSES.map((campus) => [campus.id, campus]));

export const UNIVERSITIES = {
  wits: { code: 'wits', label: 'Wits', name: 'University of the Witwatersrand' },
  uj: { code: 'uj', label: 'UJ', name: 'University of Johannesburg' },
  both: { code: 'both', label: 'Wits & UJ', name: 'Wits and UJ students' },
};

/** Campuses relevant to a property's university ('both' or unknown -> all campuses). */
export const campusesFor = (university) =>
  university === 'wits' || university === 'uj' ? CAMPUSES.filter((campus) => campus.university === university) : CAMPUSES;

/** Braamfontein, between Wits and the densest cluster of residences. */
export const DEFAULT_MAP_CENTER = [-26.1895, 28.031];
export const DEFAULT_MAP_ZOOM = 14;

/** Radius options (km) for "within X of campus" filters. */
export const RADIUS_OPTIONS = [1, 2, 3, 5, 10];
