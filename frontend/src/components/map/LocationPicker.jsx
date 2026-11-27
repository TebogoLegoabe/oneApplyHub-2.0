import { useEffect, useMemo, useRef, useState } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import { Loader2, Search } from 'lucide-react';
import { CAMPUSES } from '../../constants/campuses';
import { Button, Input } from '../ui';
import BaseMap from './BaseMap';
import CampusMarkers from './CampusMarkers';
import { pickerIcon } from './icons';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
// Wits/UJ belt — results are limited to this box.
const VIEWBOX = '27.85,-26.12,28.15,-26.30';

const ClickToPlace = ({ onPick }) => {
  useMapEvents({ click: (event) => onPick({ lat: event.latlng.lat, lng: event.latlng.lng }) });
  return null;
};

const FlyTo = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], Math.max(map.getZoom(), 17), { animate: true });
  }, [map, target]);
  return null;
};

const round = (value) => Math.round(value * 1e6) / 1e6;

/**
 * Admin tool to pin a residence: search the address (OpenStreetMap Nominatim, one
 * request per click), click the map, or drag the pin.
 */
const LocationPicker = ({ value, onChange, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);
  const icon = useMemo(() => pickerIcon(), []);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const place = (point, fly = false) => {
    const next = { lat: round(point.lat), lng: round(point.lng) };
    onChangeRef.current(next);
    if (fly) setFlyTarget(next);
  };

  const search = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const params = new URLSearchParams({ q: query.trim(), format: 'jsonv2', limit: '5', countrycodes: 'za', viewbox: VIEWBOX, bounded: '1' });
      const response = await fetch(`${NOMINATIM_URL}?${params}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('search failed');
      const data = await response.json();
      setResults(data);
      if (!data.length) setSearchError('No matches. Try the street name only, or click the map.');
    } catch {
      setSearchError('Address search is unavailable right now. Click the map to place the pin.');
    } finally {
      setSearching(false);
    }
  };

  const eventHandlers = useMemo(() => ({
    dragend: (event) => place(event.target.getLatLng()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  return (
    <div className="space-y-3">
      <form onSubmit={search} className="flex gap-2">
        <Input
          icon={Search}
          wrapperClassName="flex-1"
          aria-label="Search for an address"
          placeholder="Search an address, e.g. 12 Jorissen Street, Braamfontein"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button type="submit" variant="secondary" disabled={searching}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
          Find
        </Button>
      </form>
      {searchError && <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{searchError}</p>}
      {results.length > 0 && (
        <ul className="max-h-36 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-700" aria-label="Address results">
          {results.map((result) => (
            <li key={result.place_id}>
              <button
                type="button"
                onClick={() => { place({ lat: Number(result.lat), lng: Number(result.lon) }, true); setResults([]); }}
                className="w-full px-3 py-2 text-left text-slate-700 transition-colors hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-brand-500/10"
              >
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="h-72 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 sm:h-80">
        <BaseMap center={value ? [value.lat, value.lng] : undefined} zoom={value ? 17 : 14} scrollWheelZoom label="Pick the residence location">
          <CampusMarkers campuses={CAMPUSES} />
          <ClickToPlace onPick={(point) => place(point)} />
          <FlyTo target={flyTarget} />
          {value && <Marker position={[value.lat, value.lng]} icon={icon} draggable eventHandlers={eventHandlers} keyboard={false} />}
        </BaseMap>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Click the map or drag the pin onto the building entrance. Address search uses OpenStreetMap Nominatim.
      </p>
    </div>
  );
};

export default LocationPicker;
