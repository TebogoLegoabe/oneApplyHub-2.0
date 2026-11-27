import { Component, lazy, Suspense } from 'react';
import { MapPinOff } from 'lucide-react';
import { cn } from '../../utils/cn';

// Leaflet (~150 KB) is only downloaded on pages that actually show a map.
export const PropertiesMap = lazy(() => import('./PropertiesMap'));
export const PropertyLocationMap = lazy(() => import('./PropertyLocationMap'));
export const LocationPicker = lazy(() => import('./LocationPicker'));

export const MapSkeleton = ({ className }) => (
  <div className={cn('relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900', className)} role="status" aria-label="Loading map">
    <div className="bg-dots-dark absolute inset-0" aria-hidden="true" />
    <div className="relative flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
      <span className="h-10 w-10 animate-pulse rounded-full bg-gradient-to-br from-brand-300 to-violet-300 dark:from-brand-700 dark:to-violet-700" />
      <span className="text-xs font-semibold">Loading map…</span>
    </div>
  </div>
);

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('Map failed to load:', error); // eslint-disable-line no-console
  }

  render() {
    if (this.state.failed) {
      return (
        <div className={cn('flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 p-6 text-center dark:bg-slate-900', this.props.className)} role="status">
          <MapPinOff className="h-6 w-6 text-slate-400" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">The map could not load</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Check your connection and refresh. Distances below still work.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Suspense + error boundary so a map problem never takes the page down. */
export const MapFrame = ({ children, className }) => (
  <MapErrorBoundary className={className}>
    <Suspense fallback={<MapSkeleton className={className} />}>{children}</Suspense>
  </MapErrorBoundary>
);
