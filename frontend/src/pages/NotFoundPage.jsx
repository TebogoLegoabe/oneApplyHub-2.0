import { Home, Map as MapIcon, MapPinOff, Search } from 'lucide-react';
import { Button } from '../components/ui';

const NotFoundPage = () => (
  <div className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16">
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div className="bg-dots-dark absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-300/40 via-violet-300/30 to-coral-300/40 blur-3xl dark:from-brand-600/20 dark:via-violet-600/20 dark:to-coral-600/20" />
    </div>
    <div className="w-full max-w-lg text-center">
      <span className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rotate-6 rounded-3xl bg-gradient-to-br from-coral-400 to-violet-500 opacity-80" aria-hidden="true" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-coral-600 shadow-float dark:bg-slate-900 dark:text-coral-400">
          <MapPinOff className="h-9 w-9" aria-hidden="true" />
        </span>
      </span>
      <p className="font-display text-7xl font-extrabold tracking-tight text-gradient-dark sm:text-8xl">404</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Page not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        This page isn&apos;t on our map. It may have moved, or the address has a typo. Let&apos;s get you back to somewhere familiar.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button to="/" size="lg">
          <Home className="h-4 w-4" aria-hidden="true" />
          Go home
        </Button>
        <Button to="/properties" variant="accent" size="lg">
          <Search className="h-4 w-4" aria-hidden="true" />
          Browse properties
        </Button>
        <Button to="/properties?view=map" variant="secondary" size="lg">
          <MapIcon className="h-4 w-4" aria-hidden="true" />
          Open the map
        </Button>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
