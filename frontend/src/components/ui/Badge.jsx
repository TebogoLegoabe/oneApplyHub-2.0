import { cn } from '../../utils/cn';

const TONES = {
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/5',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200/70 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-400/20',
  gold: 'bg-gold-50 text-gold-700 ring-gold-200/70 dark:bg-gold-500/10 dark:text-gold-300 dark:ring-gold-400/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  danger: 'bg-red-50 text-red-700 ring-red-200/70 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20',
  inverse: 'bg-white/15 text-white ring-white/15',
};

const Badge = ({ tone = 'neutral', size = 'md', icon: Icon, className, children }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset',
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      TONES[tone] || TONES.neutral,
      className,
    )}
  >
    {Icon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" />}
    {children}
  </span>
);

/** Application / moderation status pill with a consistent colour per state. */
const STATUS_TONE = {
  pending: 'warning',
  under_review: 'brand',
  approved: 'success',
  partially_approved: 'brand',
  rejected: 'danger',
};

export const StatusBadge = ({ status, className }) => {
  const key = status || 'pending';
  return (
    <Badge tone={STATUS_TONE[key] || 'neutral'} className={cn('capitalize', className)}>
      {key.replace(/_/g, ' ')}
    </Badge>
  );
};

export default Badge;
