import { CAMPUS_BY_ID } from '../constants/campuses';
import {
  distancesToCampuses, estimateTravel, formatDistance, formatMinutes, hasCoords, haversineKm, nearestCampus,
  osmDirectionsUrl, ROUTE_FACTOR, SPEEDS_KMH, travelFrom, walkBand,
} from './geo';

const BRAAMFONTEIN = { latitude: -26.1932, longitude: 28.0318, university: 'wits' };
const AUCKLAND_PARK = { latitude: -26.184, longitude: 27.9995, university: 'uj' }; // next to UJ Kingsway (APK)

describe('haversineKm', () => {
  test('one degree of latitude is about 111 km', () => {
    expect(haversineKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.19, 1);
  });

  test('accepts {latitude, longitude} and {lat, lng} and is symmetric', () => {
    const wits = CAMPUS_BY_ID['wits-main'];
    expect(haversineKm(BRAAMFONTEIN, wits)).toBeCloseTo(haversineKm(wits, BRAAMFONTEIN), 10);
    expect(haversineKm(BRAAMFONTEIN, BRAAMFONTEIN)).toBe(0);
  });

  test('Wits Main to UJ Kingsway is roughly 3.3 km', () => {
    expect(haversineKm(CAMPUS_BY_ID['wits-main'], CAMPUS_BY_ID['uj-apk'])).toBeGreaterThan(3.1);
    expect(haversineKm(CAMPUS_BY_ID['wits-main'], CAMPUS_BY_ID['uj-apk'])).toBeLessThan(3.5);
  });
});

describe('estimateTravel', () => {
  test('applies the calibrated route factor and speeds', () => {
    const travel = estimateTravel(1);
    expect(travel.routeKm).toBeCloseTo(ROUTE_FACTOR, 5);
    expect(travel.walkMin).toBe(Math.round((ROUTE_FACTOR / SPEEDS_KMH.walk) * 60)); // 19 min for 1 km straight
    expect(travel.cycleMin).toBeLessThan(travel.walkMin);
    expect(travel.driveMin).toBeLessThan(travel.walkMin);
  });

  test('never reports zero minutes', () => {
    expect(estimateTravel(0).walkMin).toBe(1);
    expect(estimateTravel(0).cycleMin).toBe(1);
  });
});

describe('formatting', () => {
  test.each([
    [0.004, '10 m'],
    [0.348, '350 m'],
    [1.234, '1.2 km'],
    [12.6, '13 km'],
    [null, '—'],
  ])('formatDistance(%p) -> %p', (km, expected) => {
    expect(formatDistance(km)).toBe(expected);
  });

  test.each([
    [0.2, '1 min'],
    [14.4, '14 min'],
    [60, '1 h'],
    [95, '1 h 35 min'],
    [undefined, '—'],
  ])('formatMinutes(%p) -> %p', (minutes, expected) => {
    expect(formatMinutes(minutes)).toBe(expected);
  });

  test('walkBand thresholds', () => {
    expect(walkBand(15)).toBe('easy');
    expect(walkBand(16)).toBe('ok');
    expect(walkBand(30)).toBe('ok');
    expect(walkBand(31)).toBe('far');
    expect(walkBand(null)).toBe('unknown');
  });
});

describe('campus helpers', () => {
  test('hasCoords rejects null coordinates (Number(null) would be 0)', () => {
    expect(hasCoords(BRAAMFONTEIN)).toBe(true);
    expect(hasCoords({ latitude: null, longitude: 28 })).toBe(false);
    expect(hasCoords({ latitude: 'x', longitude: 28 })).toBe(false);
    expect(hasCoords(null)).toBe(false);
  });

  test('distancesToCampuses is sorted nearest first', () => {
    const rows = distancesToCampuses(BRAAMFONTEIN);
    expect(rows[0].campus.id).toBe('wits-main');
    rows.slice(1).forEach((row, index) => expect(row.straightKm).toBeGreaterThanOrEqual(rows[index].straightKm));
    expect(distancesToCampuses({ latitude: null, longitude: null })).toEqual([]);
  });

  test('nearestCampus only considers the property university', () => {
    expect(nearestCampus(BRAAMFONTEIN).campus.id).toBe('wits-main');
    expect(nearestCampus(AUCKLAND_PARK).campus.university).toBe('uj');
    expect(nearestCampus({ ...AUCKLAND_PARK, university: 'both' }).campus.id).toBe('uj-apk');
  });

  test('travelFrom prefers the server distance to the chosen origin', () => {
    const origin = { ...CAMPUS_BY_ID['uj-apk'], short: 'UJ APK' };
    const travel = travelFrom({ ...BRAAMFONTEIN, distance_km: 2 }, origin);
    expect(travel.straightKm).toBe(2);
    expect(travel.label).toBe('UJ APK');
    expect(travelFrom({ latitude: null, longitude: null }, origin)).toBeNull();
    expect(travelFrom(BRAAMFONTEIN, null).label).toBe('Wits Main');
  });

  test('osmDirectionsUrl builds a walking route link', () => {
    const url = osmDirectionsUrl(BRAAMFONTEIN, CAMPUS_BY_ID['wits-main']);
    expect(url).toContain('https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot');
    expect(decodeURIComponent(url)).toContain('-26.193200,28.031800;-26.192082,28.030373');
  });
});
