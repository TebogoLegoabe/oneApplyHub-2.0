import { useCallback, useState } from 'react';

/**
 * Browser geolocation on demand. The position stays in memory only — it is never put
 * in the URL or sent anywhere except as a query to our own API for distance sorting.
 */
export const useGeolocation = () => {
  const [state, setState] = useState({ status: 'idle', position: null, error: null });

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState({ status: 'error', position: null, error: 'Your browser does not support location.' });
      return;
    }
    setState((previous) => ({ ...previous, status: 'loading', error: null }));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setState({
        status: 'ready',
        position: { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy },
        error: null,
      }),
      (error) => setState({
        status: 'error',
        position: null,
        error: error.code === 1 ? 'Location permission was denied. Allow it in your browser to sort by distance from you.' : 'We could not find your location. Try again.',
      }),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  return { ...state, request };
};
