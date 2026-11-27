import { useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import { CAMPUSES } from '../../constants/campuses';
import { campusIcon } from './icons';

const CampusMarker = ({ campus, active, onSelect }) => {
  const icon = useMemo(() => campusIcon(campus, active), [campus, active]);
  const handlers = useMemo(() => (onSelect ? { click: () => onSelect(campus.id) } : undefined), [onSelect, campus.id]);
  return (
    <Marker position={[campus.lat, campus.lng]} icon={icon} title={campus.name} keyboard={Boolean(onSelect)} zIndexOffset={active ? 900 : 400} eventHandlers={handlers}>
      <Tooltip direction="top" offset={[0, -22]} className="oah-tooltip">{campus.name} · {campus.area}</Tooltip>
    </Marker>
  );
};

/** Graduation-cap markers for every Wits and UJ campus. */
const CampusMarkers = ({ campuses = CAMPUSES, activeId, onSelect }) => (
  <>
    {campuses.map((campus) => (
      <CampusMarker key={campus.id} campus={campus} active={campus.id === activeId} onSelect={onSelect} />
    ))}
  </>
);

export default CampusMarkers;
