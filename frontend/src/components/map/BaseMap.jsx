import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, ScaleControl, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../constants/campuses';
import { cn } from '../../utils/cn';
import { MAX_ZOOM, TILE_ATTRIBUTION, TILE_URL } from './mapConfig';

/** Keeps Leaflet's size in sync when the container resizes (split views, drawers, tabs). */
const SizeSync = () => {
  const map = useMap();
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => map.invalidateSize({ debounceMoveend: true }));
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
};

/** Gives the keyboard-focusable map container an accessible name. */
const MapLabel = ({ label }) => {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', label);
  }, [map, label]);
  return null;
};

/** Fits the view to a set of [lat, lng] points whenever `fitKey` changes. */
export const FitToPoints = ({ points, fitKey, padding, maxZoom = 16 }) => {
  const map = useMap();
  useEffect(() => {
    const valid = (points || []).filter((point) => point && Number.isFinite(point[0]) && Number.isFinite(point[1]));
    if (!valid.length) return;
    if (valid.length === 1) {
      map.setView(valid[0], Math.min(maxZoom, 16), { animate: false });
      return;
    }
    // Less padding on narrow phone maps so the residences fill the screen.
    const pad = padding ?? (map.getSize().x < 640 ? 20 : 48);
    map.fitBounds(L.latLngBounds(valid), { padding: [pad, pad], maxZoom, animate: false });
    // Refit only when the caller says the point set changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, fitKey]);
  return null;
};

/** OpenStreetMap base map with the app's controls and styling. */
const BaseMap = ({
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  className,
  label = 'Map of student accommodation',
  scrollWheelZoom = false,
  interactive = true,
  children,
}) => (
  <MapContainer
    center={center}
    zoom={zoom}
    maxZoom={MAX_ZOOM}
    className={cn('oah-map', className)}
    zoomControl={false}
    scrollWheelZoom={interactive && scrollWheelZoom}
    dragging={interactive}
    touchZoom={interactive}
    doubleClickZoom={interactive}
    boxZoom={interactive}
    keyboard={interactive}
    tap={interactive}
  >
    <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} className="oah-tiles" maxZoom={MAX_ZOOM} />
    {interactive && <ZoomControl position="topright" />}
    <ScaleControl position="bottomleft" imperial={false} />
    <SizeSync />
    <MapLabel label={label} />
    {children}
  </MapContainer>
);

export default BaseMap;
