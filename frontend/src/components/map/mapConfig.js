/**
 * Map tiles. Defaults to the OpenStreetMap standard tile server, which allows normal
 * browser use with visible attribution (https://operations.osmfoundation.org/policies/tiles/)
 * but may withdraw access from heavy commercial users. For production traffic, set
 * REACT_APP_MAP_TILE_URL (and REACT_APP_MAP_ATTRIBUTION) to a commercial OSM tile
 * provider or your own tile server.
 */
export const TILE_URL = process.env.REACT_APP_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const TILE_ATTRIBUTION = process.env.REACT_APP_MAP_ATTRIBUTION
  || '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

export const MAX_ZOOM = 19;
