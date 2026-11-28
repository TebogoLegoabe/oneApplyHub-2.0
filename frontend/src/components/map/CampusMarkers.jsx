import { useEffect, useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import { CAMPUSES } from '../../constants/campuses';
import { campusIcon } from './icons';

// Below this zoom the Braamfontein colleges' name labels collide (see .oah-compact-college-labels):
// Rosebank College and Boston City Campus are only ~130 m apart.
const COLLEGE_LABEL_MIN_ZOOM = 17;

/** Flags the map container while zoomed out so CSS can hide overlapping college labels. */
const useCompactCollegeLabels = () => {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const update = () => container.classList.toggle('oah-compact-college-labels', map.getZoom() < COLLEGE_LABEL_MIN_ZOOM);
    update();
    map.on('zoomend', update);
    return () => {
      map.off('zoomend', update);
      container.classList.remove('oah-compact-college-labels');
    };
  }, [map]);
};

const CampusMarker = ({ campus, active, onSelect }) => {
  const icon = useMemo(() => campusIcon(campus, active), [campus, active]);
  const handlers = useMemo(() => (onSelect ? { click: () => onSelect(campus.id) } : undefined), [onSelect, campus.id]);
  return (
    <Marker position={[campus.lat, campus.lng]} icon={icon} title={campus.name} keyboard={Boolean(onSelect)} zIndexOffset={active ? 900 : 400} eventHandlers={handlers}>
      <Tooltip direction="top" offset={[0, -22]} className="oah-tooltip">{campus.name} · {campus.area}</Tooltip>
    </Marker>
  );
};

/** Markers for every campus: a graduation cap for Wits and UJ, a school building for colleges. */
const CampusMarkers = ({ campuses = CAMPUSES, activeId, onSelect }) => {
  useCompactCollegeLabels();
  return (
    <>
      {campuses.map((campus) => (
        <CampusMarker key={campus.id} campus={campus} active={campus.id === activeId} onSelect={onSelect} />
      ))}
    </>
  );
};

export default CampusMarkers;
