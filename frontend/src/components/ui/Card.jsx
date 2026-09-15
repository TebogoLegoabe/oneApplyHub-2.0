import { cn } from '../../utils/cn';

export const CARD_CLASS = 'rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900';

const Card = ({ as: Tag = 'div', className, padded = true, hover = false, children, ...props }) => (
  <Tag
    className={cn(
      CARD_CLASS,
      padded && 'p-5 sm:p-6',
      hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover dark:hover:border-brand-900',
      className,
    )}
    {...props}
  >
    {children}
  </Tag>
);

export const CardHeader = ({ title, description, icon: Icon, action, className }) => (
  <div className={cn('flex items-start justify-between gap-4', className)}>
    <div className="flex min-w-0 items-start gap-3">
      {Icon && (
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white sm:text-base">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{description}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default Card;
