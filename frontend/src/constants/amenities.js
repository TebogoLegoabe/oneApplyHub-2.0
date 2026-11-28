import {
  Accessibility, AirVent, Armchair, BatteryCharging, Bath, BedDouble, Bike, BookOpen, Bus, Cctv, Check, Clapperboard,
  CookingPot, Droplets, Dumbbell, Fingerprint, Flame, Gamepad2, Heater, KeyRound, Monitor, PawPrint, Printer, Refrigerator,
  ShieldCheck, ShowerHead, Sofa, SprayCan, SquareParking, Sun, Trees, Tv, UtensilsCrossed, Volleyball, WashingMachine,
  WavesLadder, Wifi, Wrench, Zap,
} from 'lucide-react';

/**
 * Amenity name -> icon. Listings (and admins) write amenities in their own words, so this
 * matches keywords instead of exact names. Rules are checked in order and the first match
 * wins, so the more specific ones come first (e.g. "Secure parking" is parking, not security).
 */
export const AMENITY_ICON_RULES = [
  [/cctv|camera|surveillance/, Cctv],
  [/biometric|fingerprint/, Fingerprint],
  [/access control|card access|key ?card|tag access/, KeyRound],
  [/parking|garage/, SquareParking],
  [/bike|bicycle|cycling/, Bike],
  [/secur|guard|electric fence|patrol/, ShieldCheck],
  [/wi-?fi|internet|fibre|fiber|uncapped/, Wifi],
  [/laundry|laundromat|washing|washer/, WashingMachine],
  [/gym|fitness|weights/, Dumbbell],
  [/study|library|reading/, BookOpen],
  [/braai|bbq|barbecue/, Flame],
  [/dining|meals?\b|cafeteria|canteen|catering/, UtensilsCrossed],
  [/kitchen|cooking/, CookingPot],
  [/fridge|refrigerator/, Refrigerator],
  [/entertainment|recreation|games|gaming|pool table|table tennis/, Gamepad2],
  [/swim|pool/, WavesLadder],
  [/cinema|movie|film|theatre/, Clapperboard],
  [/\btv\b|television|dstv/, Tv],
  [/sport|\bcourts?\b|soccer|football|basketball|netball|volleyball|tennis/, Volleyball],
  [/common room|lounge|communal area/, Sofa],
  [/garden|courtyard|outdoor/, Trees],
  [/transport|shuttle|\bbus\b/, Bus],
  [/solar/, Sun],
  [/backup power|generator|inverter|load ?shedding|\bups\b/, BatteryCharging],
  [/electricity|prepaid|\bpower\b/, Zap],
  [/heater|heating/, Heater],
  [/air ?con|aircon|cooling|\bfans?\b/, AirVent],
  [/handyman|maintenance|repairs?\b/, Wrench],
  [/sleepover|guest/, BedDouble],
  [/clean|housekeeping/, SprayCan],
  [/water/, Droplets],
  [/en-?suite|bathroom|\bbath\b/, Bath],
  [/shower/, ShowerHead],
  [/furnish/, Armchair],
  [/wheelchair|accessib/, Accessibility],
  [/\bpets?\b|pet[- ]friendly/, PawPrint],
  [/print/, Printer],
  [/computer|\blab\b/, Monitor],
];

/** Shown for an amenity no rule recognises: a plain "included" tick. */
export const DEFAULT_AMENITY_ICON = Check;

export const parseAmenities = (amenitiesString) => {
  try {
    return JSON.parse(amenitiesString || '[]');
  } catch {
    return [];
  }
};

export const getAmenityIconComponent = (amenity) => {
  const name = String(amenity || '').toLowerCase();
  const rule = AMENITY_ICON_RULES.find(([pattern]) => pattern.test(name));
  return rule ? rule[1] : DEFAULT_AMENITY_ICON;
};

/** The amenity's name is always shown next to its icon, so the icon is hidden from screen readers. */
export const renderAmenityIcon = (amenity, className = 'w-4 h-4') => {
  const Icon = getAmenityIconComponent(amenity);
  return <Icon className={className} aria-hidden="true" />;
};
