import { cn } from '../../utils/cn';

const VARIANTS = {
  light: {
    on: 'bg-ink-950 text-white ring-ink-950 dark:bg-white dark:text-ink-950 dark:ring-white',
    off: 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800',
  },
  // For chips placed over a photo or a dark band.
  dark: {
    on: 'bg-white text-ink-950 ring-white',
    off: 'bg-white/10 text-white ring-white/30 hover:bg-white/20',
  },
};

/**
 * Toggle chip for a filter group. Wrap a set of chips in an element with
 * role="group" and an aria-label so screen readers announce what they filter.
 */
const Chip = ({ active = false, onClick, icon: Icon, variant = 'light', className, children }) => {
  const tone = VARIANTS[variant] || VARIANTS.light;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
        active ? tone.on : tone.off,
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Chip;
