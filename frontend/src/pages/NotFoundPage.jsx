import { Compass, Home, Search } from 'lucide-react';
import { Button } from '../components/ui';

const NotFoundPage = () => (
  <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
    <div className="w-full max-w-md text-center">
      <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Page not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        The page you are looking for does not exist or may have moved. Check the address or head back to a familiar place.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button to="/" size="lg">
          <Home className="h-4 w-4" aria-hidden="true" />
          Go home
        </Button>
        <Button to="/properties" variant="secondary" size="lg">
          <Search className="h-4 w-4" aria-hidden="true" />
          Browse properties
        </Button>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
