import { useMemo } from 'react';
import { Marker, Polyline, Tooltip } from 'react-leaflet';
import { cn } from '../../utils/cn';
import { toPoint } from '../../utils/geo';
import BaseMap, { FitToPoints } from './BaseMap';
import CampusMarkers from './CampusMarkers';
import { homeIcon } from './icons';

const CASING = { color: '#ffffff', weight: 9, opacity: 0.9, lineCap: 'round', lineJoin: 'round' };
const ROUTE = { color: '#0b66d6', weight: 5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' };
const STRAIGHT = { color: '#d63a17', weight: 3, opacity: 0.85, dashArray: '2 10', lineCap: 'round' };

/**
 * A residence with every campus around it. The selected campus is joined by the real
 * walking route when one has been fetched, otherwise by a dashed straight line.
 */
const PropertyLocationMap = ({ property, campuses, selectedCampusId, onSelectCampus, route, className }) => {
  const home = toPoint(property);
  const selected = campuses.find((campus) => campus.id === selectedCampusId) || null;
  const homeMarkerIcon = useMemo(() => homeIcon(), []);
  const points = selected ? [[home.lat, home.lng], [selected.lat, selected.lng], ...(route?.coordinates || [])] : [[home.lat, home.lng]];

  return (
    <div className={cn('relative isolate overflow-hidden', className)} data-testid="property-location-map">
      <BaseMap center={[home.lat, home.lng]} zoom={15} label={`Map showing ${property.name} and nearby campuses`}>
        <CampusMarkers campuses={campuses} activeId={selectedCampusId} onSelect={onSelectCampus} />
        {selected && (route?.coordinates?.length ? (
          <>
            <Polyline positions={route.coordinates} pathOptions={CASING} />
            <Polyline positions={route.coordinates} pathOptions={ROUTE} />
          </>
        ) : (
          <Polyline positions={[[home.lat, home.lng], [selected.lat, selected.lng]]} pathOptions={STRAIGHT} />
        ))}
        <Marker position={[home.lat, home.lng]} icon={homeMarkerIcon} keyboard={false} zIndexOffset={1000}>
          <Tooltip direction="top" offset={[0, -48]} className="oah-tooltip">{property.name}</Tooltip>
        </Marker>
        <FitToPoints points={points} fitKey={`${selectedCampusId}|${route ? route.coordinates.length : 0}`} maxZoom={16} />
      </BaseMap>
    </div>
  );
};

export default PropertyLocationMap;
