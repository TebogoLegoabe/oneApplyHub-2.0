import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const SIZES = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' };

export const Spinner = ({ size = 'md', className }) => (
  <Loader2 className={cn('animate-spin text-brand-600 dark:text-brand-300', SIZES[size], className)} aria-hidden="true" />
);

/** Full-viewport loading state used by route guards and page-level fetches. */
export const PageLoader = ({ label = 'Loading…' }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400" role="status" aria-live="polite">
    <Spinner size="lg" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

// Rendered as a block-level <span> so it is valid inside <p> and headings as well as containers.
export const Skeleton = ({ className }) => (
  <span className={cn('block animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800', className)} aria-hidden="true" />
);

export default Spinner;
