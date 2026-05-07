import { Wifi, Shield, Car, Users, MessageSquare, Check } from 'lucide-react';

// Icon component references keyed by amenity name.
// Each page renders them with its own size class.
export const AMENITY_ICON_MAP = {
  WiFi: Wifi,
  Security: Shield,
  '24/7 Security': Shield,
  Parking: Car,
  Gym: Users,
  'Study Areas': MessageSquare,
  Laundry: Check,
  'Dining Hall': Users,
};

export const parseAmenities = (amenitiesString) => {
  try {
    return JSON.parse(amenitiesString || '[]');
  } catch {
    return [];
  }
};

export const getAmenityIconComponent = (amenity) =>
  AMENITY_ICON_MAP[amenity] ?? Check;

export const renderAmenityIcon = (amenity, className = 'w-4 h-4') => {
  const Icon = getAmenityIconComponent(amenity);
  return <Icon className={className} />;
};
