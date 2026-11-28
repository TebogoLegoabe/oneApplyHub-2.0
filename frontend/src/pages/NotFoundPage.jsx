import { Home, MapPinOff, Search } from 'lucide-react';
import { Button } from '../components/ui';

const NotFoundPage = () => (
  <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
    <div className="w-full max-w-lg text-center">
      <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <MapPinOff className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Page not found</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
        We couldn&apos;t find that page. It may have moved, or the address may have a typo.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button to="/" size="lg">
          <Home className="h-4 w-4" aria-hidden="true" />
          Go home
        </Button>
        <Button to="/properties" variant="secondary" size="lg">
          <Search className="h-4 w-4" aria-hidden="true" />
          Find a res
        </Button>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
