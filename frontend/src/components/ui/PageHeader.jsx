import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Standard page intro used across the authenticated shell: optional back link,
 * eyebrow pill, title, description, and a right-aligned action slot.
 */
const PageHeader = ({ eyebrow, icon: Icon, title, description, action, backTo, backLabel = 'Back', className }) => (
  <header className={cn('rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:px-6 sm:py-5', className)}>
    {backTo && (
      <Link to={backTo} className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        {backLabel}
      </Link>
    )}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  </header>
);

export default PageHeader;
