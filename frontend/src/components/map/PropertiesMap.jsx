import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Marker, Tooltip } from 'react-leaflet';
import { Loader2, MapPinOff, X } from 'lucide-react';
import { CAMPUSES } from '../../constants/campuses';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/format';
import { hasCoords, travelFrom } from '../../utils/geo';
import { DistanceBadge, PropertyImage, RatingPill } from '../property/PropertyBits';
import BaseMap, { FitToPoints } from './BaseMap';
import CampusMarkers from './CampusMarkers';
import ClusterLayer from './ClusterLayer';
import { meIcon } from './icons';

const Legend = () => (
  <div className="pointer-events-none absolute left-3 top-3 z-[400] flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-lg backdrop-blur dark:bg-slate-900/90 dark:text-slate-200">
    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-600" />Wits</span>
    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-coral-500" />UJ</span>
    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" />Both</span>
    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-ink-800 dark:bg-slate-300" />Campus</span>
  </div>
);

const MapPropertyCard = ({ property, origin, onClose }) => {
  const travel = travelFrom(property, origin);
  return (
    <div className="pointer-events-auto relative flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 pr-9 shadow-float animate-slide-up dark:border-slate-700 dark:bg-slate-900" data-testid="map-preview-card">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
        <PropertyImage property={property} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold text-slate-950 dark:text-white">{property.name}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{property.address}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <RatingPill rating={property.average_rating} count={property.review_count} className="py-0.5" />
          {travel && <DistanceBadge travel={travel} size="sm" showLabel={false} />}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="truncate text-sm font-extrabold text-ink-950 dark:text-white">
            {formatCurrency(property.price_min)}<span className="text-xs font-semibold text-slate-500"> /month</span>
          </p>
          <Link to={`/properties/${property.id}`} className="shrink-0 rounded-lg bg-coral-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-coral-700">
            View
          </Link>
        </div>
      </div>
      <button type="button" onClick={onClose} className="absolute right-2 top-2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Close preview">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

/**
 * Map of residences with campus markers. Pins are clustered; clicking one opens a
 * preview card. `origin` (a campus or the student's location) is highlighted.
 */
const PropertiesMap = ({
  properties = [],
  loading = false,
  origin = null,
  activeId = null,
  onHover,
  selectedId = null,
  onSelect,
  unmapped = 0,
  fitKey,
  className,
  scrollWheelZoom = false,
  interactive = true,
  showLegend = true,
  label = 'Map of student accommodation near Wits and UJ',
}) => {
  const located = useMemo(() => properties.filter(hasCoords), [properties]);
  const selected = located.find((property) => property.id === selectedId) || null;
  const points = useMemo(() => {
    const list = located.map((property) => [Number(property.latitude), Number(property.longitude)]);
    if (origin) list.push([origin.lat, origin.lng]);
    return list;
  }, [located, origin]);
  const computedFitKey = fitKey ?? `${origin?.id || 'none'}|${located.map((property) => property.id).join(',')}`;
  const originCampusId = origin?.kind === 'campus' ? origin.id : null;

  return (
    <div className={cn('relative isolate overflow-hidden', className)} data-testid="properties-map">
      <BaseMap label={label} scrollWheelZoom={scrollWheelZoom} interactive={interactive}>
        <CampusMarkers campuses={CAMPUSES} activeId={originCampusId} />
        {origin?.kind === 'me' && (
          <Marker position={[origin.lat, origin.lng]} icon={meIcon()} keyboard={false} zIndexOffset={950}>
            <Tooltip direction="top" offset={[0, -10]} className="oah-tooltip">You are here</Tooltip>
          </Marker>
        )}
        <ClusterLayer properties={located} activeId={selectedId ?? activeId} onSelect={onSelect} onHover={onHover} interactive={interactive} />
        <FitToPoints points={points} fitKey={computedFitKey} maxZoom={16} />
      </BaseMap>

      {showLegend && <Legend />}

      {loading && (
        <div className="pointer-events-none absolute right-14 top-3 z-[400] inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow-lg dark:bg-slate-900/90 dark:text-slate-300" role="status">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" aria-hidden="true" />Updating map…
        </div>
      )}

      {unmapped > 0 && !selected && (
        <p className="pointer-events-none absolute left-3 top-14 z-[400] inline-flex items-center gap-1.5 sm:bottom-8 sm:left-auto sm:right-3 sm:top-auto rounded-xl bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-lg dark:bg-slate-900/90 dark:text-slate-300">
          <MapPinOff className="h-3.5 w-3.5" aria-hidden="true" />
          {unmapped} without a map pin yet
        </p>
      )}

      {selected && (
        <div className="pointer-events-none absolute inset-x-3 bottom-8 z-[500] mx-auto max-w-md">
          <MapPropertyCard property={selected} origin={origin} onClose={() => onSelect?.(null)} />
        </div>
      )}
    </div>
  );
};

export default PropertiesMap;
