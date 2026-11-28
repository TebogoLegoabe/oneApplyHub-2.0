import fs from 'fs';
import path from 'path';
import {
  BookOpen, Dumbbell, Flame, Gamepad2, ShieldCheck, SquareParking, Trees, WashingMachine, WavesLadder, Wifi,
} from 'lucide-react';
import { DEFAULT_AMENITY_ICON, getAmenityIconComponent } from './amenities';

const DATA_FILE = path.resolve(__dirname, '../../../backend/data/properties.json');
const describeIfData = fs.existsSync(DATA_FILE) ? describe : describe.skip;

describe('amenity icons', () => {
  test.each([
    ['WiFi', Wifi],
    ['Laundry', WashingMachine],
    ['Gym', Dumbbell],
    ['Study Areas', BookOpen],
    ['24/7 Security', ShieldCheck],
    ['Swimming Pool', WavesLadder],
    ['Braai Area', Flame],
    // More specific rules win over looser ones.
    ['Secure parking', SquareParking],
    ['Courtyard', Trees],
    ['Pool table', Gamepad2],
  ])('%s gets its own icon', (amenity, icon) => {
    expect(getAmenityIconComponent(amenity)).toBe(icon);
  });

  test('unknown amenities fall back to a plain tick', () => {
    expect(getAmenityIconComponent('Rooftop helipad')).toBe(DEFAULT_AMENITY_ICON);
    expect(getAmenityIconComponent(undefined)).toBe(DEFAULT_AMENITY_ICON);
  });
});

describeIfData('amenities in the seeded listings', () => {
  const amenities = [...new Set(
    JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).flatMap((property) => property.amenities || []),
  )];

  test('every one has a matching icon, not the fallback tick', () => {
    const unmatched = amenities.filter((amenity) => getAmenityIconComponent(amenity) === DEFAULT_AMENITY_ICON);
    expect(unmatched).toEqual([]);
  });
});
