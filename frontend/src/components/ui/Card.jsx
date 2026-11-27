import { cn } from '../../utils/cn';

export const CARD_CLASS = 'rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900';

const Card = ({ as: Tag = 'div', className, padded = true, hover = false, children, ...props }) => (
  <Tag
    className={cn(
      CARD_CLASS,
      padded && 'p-5 sm:p-6',
      hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:hover:border-brand-800',
      className,
    )}
    {...props}
  >
    {children}
  </Tag>
);

const ICON_TONES = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
  coral: 'bg-coral-50 text-coral-600 dark:bg-coral-500/10 dark:text-coral-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  gold: 'bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-300',
  cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300',
};

export const CardHeader = ({ title, description, icon: Icon, iconTone = 'brand', action, className }) => (
  <div className={cn('flex items-start justify-between gap-4', className)}>
    <div className="flex min-w-0 items-start gap-3">
      {Icon && (
        <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', ICON_TONES[iconTone] || ICON_TONES.brand)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-slate-950 dark:text-white sm:text-base">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{description}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default Card;
