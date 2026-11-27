import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { useMap } from 'react-leaflet';
import { formatCurrency } from '../../utils/format';
import { hasCoords } from '../../utils/geo';
import { clusterIcon, propertyIcon } from './icons';

/**
 * Residence price pins, clustered when they overlap (Braamfontein is dense).
 * Leaflet.markercluster is imperative, so markers are managed directly on the map.
 */
const ClusterLayer = ({ properties, activeId, onSelect, onHover, interactive = true }) => {
  const map = useMap();
  const groupRef = useRef(null);
  const markersRef = useRef(new Map());
  const handlersRef = useRef({ onSelect, onHover });
  handlersRef.current = { onSelect, onHover };

  useEffect(() => {
    // Several residences share a street-level pin, so clusters are kept to max zoom and
    // then "spiderfied" — otherwise identical pins would stack and become unclickable.
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 42,
      iconCreateFunction: clusterIcon,
      chunkedLoading: true,
    });
    groupRef.current = group;
    map.addLayer(group);
    const markers = markersRef.current;
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
      markers.clear();
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    markersRef.current.clear();
    const markers = properties.filter(hasCoords).map((property) => {
      const marker = L.marker([Number(property.latitude), Number(property.longitude)], {
        icon: propertyIcon(property, property.id === activeId),
        title: `${property.name}, from ${formatCurrency(property.price_min)} per month`,
        riseOnHover: true,
        // Preview maps are decorative: keep their pins out of the tab order.
        keyboard: interactive,
        interactive,
      });
      marker.on('click', () => handlersRef.current.onSelect?.(property.id));
      marker.on('mouseover', () => handlersRef.current.onHover?.(property.id));
      marker.on('mouseout', () => handlersRef.current.onHover?.(null));
      markersRef.current.set(property.id, { marker, property });
      return marker;
    });
    group.addLayers(markers);
    // activeId is applied by the effect below; rebuilding markers on hover would be wasteful.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, interactive]);

  useEffect(() => {
    markersRef.current.forEach(({ marker, property }, id) => {
      const active = id === activeId;
      marker.setIcon(propertyIcon(property, active));
      marker.setZIndexOffset(active ? 1000 : 0);
    });
  }, [activeId, properties]);

  return null;
};

export default ClusterLayer;
