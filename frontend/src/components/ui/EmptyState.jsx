import { cn } from '../../utils/cn';

const EmptyState = ({ icon: Icon, title, description, action, compact = false, className }) => (
  <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-8' : 'px-4 py-14', className)}>
    {Icon && (
      <span className="relative mb-4 flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 rotate-6 rounded-2xl bg-gradient-to-br from-brand-200 to-violet-200 dark:from-brand-500/20 dark:to-violet-500/20" aria-hidden="true" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:text-brand-300 dark:ring-slate-700">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      </span>
    )}
    <p className="font-display text-base font-bold text-slate-900 dark:text-white sm:text-lg">{title}</p>
    {description && <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
