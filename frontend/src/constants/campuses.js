/**
 * Campus reference points used for "how far is it?" distances and map markers.
 *
 * University campuses: central, well-known points from OpenStreetMap (e.g. the Great
 * Hall for Wits Main). Colleges: campus locations from OpenStreetMap, addresses
 * checked against each college's own website (Nov 2026).
 *
 * `group` drives colours: wits (blue), uj (orange), college (green).
 */
export const CAMPUSES = [
  { id: 'wits-main', kind: 'university', group: 'wits', university: 'wits', name: 'Wits Main Campus', short: 'Wits Main', area: 'Braamfontein', lat: -26.192082, lng: 28.030373 },
  { id: 'wits-education', kind: 'university', group: 'wits', university: 'wits', name: 'Wits Education Campus', short: 'Wits Education', area: 'Parktown', lat: -26.18076, lng: 28.039886 },
  { id: 'wits-medical', kind: 'university', group: 'wits', university: 'wits', name: 'Wits Health Sciences', short: 'Wits Medical', area: 'Parktown', lat: -26.176754, lng: 28.04446 },
  { id: 'uj-apk', kind: 'university', group: 'uj', university: 'uj', name: 'UJ Auckland Park Kingsway', short: 'UJ APK', area: 'Auckland Park', lat: -26.18532, lng: 27.997183 },
  { id: 'uj-apb', kind: 'university', group: 'uj', university: 'uj', name: 'UJ Bunting Road', short: 'UJ APB', area: 'Cottesloe', lat: -26.188538, lng: 28.015207 },
  { id: 'uj-dfc', kind: 'university', group: 'uj', university: 'uj', name: 'UJ Doornfontein', short: 'UJ DFC', area: 'Doornfontein', lat: -26.193816, lng: 28.05599 },
  { id: 'uj-swc', kind: 'university', group: 'uj', university: 'uj', name: 'UJ Soweto', short: 'UJ Soweto', area: 'Soweto', lat: -26.261232, lng: 27.922167 },
  { id: 'rosebank-college', kind: 'college', group: 'college', university: null, name: 'IIE Rosebank College Braamfontein', short: 'Rosebank College', area: 'Braamfontein', lat: -26.192585, lng: 28.033937 },
  { id: 'boston-city-campus', kind: 'college', group: 'college', university: null, name: 'Boston City Campus Braamfontein', short: 'Boston City Campus', area: 'Braamfontein', lat: -26.191801, lng: 28.034919 },
  { id: 'cityvarsity', kind: 'college', group: 'college', university: null, name: 'CityVarsity Johannesburg', short: 'CityVarsity', area: 'Braamfontein', lat: -26.19147, lng: 28.037701 },
  { id: 'damelin-braamfontein', kind: 'college', group: 'college', university: null, name: 'Damelin Braamfontein', short: 'Damelin', area: 'Braamfontein', lat: -26.193296, lng: 28.038009 },
  { id: 'cjc-parktown', kind: 'college', group: 'college', university: null, name: 'Central Johannesburg TVET College (Parktown)', short: 'CJC Parktown', area: 'Parktown', lat: -26.174392, lng: 28.049282 },
];

export const CAMPUS_BY_ID = Object.fromEntries(CAMPUSES.map((campus) => [campus.id, campus]));
export const UNIVERSITY_CAMPUSES = CAMPUSES.filter((campus) => campus.kind === 'university');
export const COLLEGE_CAMPUSES = CAMPUSES.filter((campus) => campus.kind === 'college');

export const CAMPUS_GROUPS = [
  { id: 'wits', label: 'Wits', campuses: CAMPUSES.filter((campus) => campus.group === 'wits') },
  { id: 'uj', label: 'UJ', campuses: CAMPUSES.filter((campus) => campus.group === 'uj') },
  { id: 'college', label: 'Colleges', campuses: COLLEGE_CAMPUSES },
];

export const UNIVERSITIES = {
  wits: { code: 'wits', label: 'Wits', name: 'University of the Witwatersrand' },
  uj: { code: 'uj', label: 'UJ', name: 'University of Johannesburg' },
  both: { code: 'both', label: 'Wits & UJ', name: 'Wits and UJ students' },
};

/**
 * Campuses relevant to a residence's university: its own university's campuses, or
 * every university campus for 'both'. Colleges are opt-in (chosen as a search origin)
 * so a Wits/UJ residence never defaults to "3 min to a college".
 */
export const campusesFor = (university) =>
  university === 'wits' || university === 'uj' ? CAMPUSES.filter((campus) => campus.university === university) : UNIVERSITY_CAMPUSES;

/** Braamfontein, between Wits and the densest cluster of residences. */
export const DEFAULT_MAP_CENTER = [-26.1895, 28.031];
export const DEFAULT_MAP_ZOOM = 14;

/** Radius options (km) for "within X of campus" filters. */
export const RADIUS_OPTIONS = [1, 2, 3, 5, 10];
