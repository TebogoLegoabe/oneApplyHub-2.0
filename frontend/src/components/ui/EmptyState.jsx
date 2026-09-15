import { cn } from '../../utils/cn';

const EmptyState = ({ icon: Icon, title, description, action, compact = false, className }) => (
  <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-8' : 'px-4 py-14', className)}>
    {Icon && (
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
    )}
    <p className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">{title}</p>
    {description && <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
