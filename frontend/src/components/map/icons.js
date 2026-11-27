import L from 'leaflet';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

const GRADUATION_CAP = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>';
const HOUSE = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
const PIN = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><path fill="#d63a17" stroke="#fff" stroke-width="1.5" d="M12 22s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="10" r="2.8" fill="#fff"/></svg>';

/** "R5 200" -> "R5.2k" for compact price pins. */
export const formatPinPrice = (price) => {
  if (!price) return 'View';
  if (price < 1000) return `R${price}`;
  const thousands = price / 1000;
  return `R${(Math.round(thousands * 10) / 10).toString()}k`;
};

const UNIVERSITY_CLASS = { wits: 'wits', uj: 'uj', both: 'both' };

export const propertyIcon = (property, active = false) => L.divIcon({
  className: `oah-pin-wrap${active ? ' is-active' : ''}`,
  html: `<div class="oah-pin oah-pin--${UNIVERSITY_CLASS[property.university] || 'both'}${active ? ' is-active' : ''}"><span class="oah-pin__dot"></span>${escapeHtml(formatPinPrice(property.price_min))}</div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export const clusterIcon = (cluster) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 38 : count < 25 ? 44 : 52;
  return L.divIcon({
    html: `<div class="oah-cluster" aria-label="${count} residences">${count}</div>`,
    className: 'oah-cluster-wrap',
    iconSize: L.point(size, size),
  });
};

export const campusIcon = (campus, active = false) => L.divIcon({
  className: 'oah-campus-wrap',
  html: `<div class="oah-campus oah-campus--${escapeHtml(campus.university)}${active ? ' is-active' : ''}"><span class="oah-campus__icon">${GRADUATION_CAP}</span><span class="oah-campus__label">${escapeHtml(campus.short)}</span></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export const homeIcon = () => L.divIcon({
  className: 'oah-home-wrap',
  html: `<div class="oah-home"><span class="oah-home__pin">${HOUSE}</span></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export const meIcon = () => L.divIcon({
  className: 'oah-me-wrap',
  html: '<div class="oah-me"></div>',
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export const pickerIcon = () => L.divIcon({
  className: 'oah-picker-wrap',
  html: `<div class="oah-picker">${PIN}</div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});
