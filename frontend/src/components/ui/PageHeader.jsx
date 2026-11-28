import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import PhotoCredit from './PhotoCredit';

/**
 * Page intro: optional back link, eyebrow, title, description, a right-aligned action
 * slot, and `children` for extra controls. Pass `image` (from constants/photos) for a
 * photo banner; otherwise it renders as a plain, quiet heading.
 */
const PageHeader = ({ eyebrow, icon: Icon, title, description, action, backTo, backLabel = 'Back', image, className, children }) => {
  if (image) {
    return (
      <header className={cn('relative isolate overflow-hidden rounded-2xl bg-ink-950 text-white', className)}>
        <img src={image.src} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        {/* Plain dark scrim so white text stays readable over any part of the photo. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950/90 via-ink-950/75 to-ink-950/40" aria-hidden="true" />
        <div className="px-5 py-7 sm:px-8 sm:py-9">
          {backTo && (
            <Link to={backTo} className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 transition-colors hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />{backLabel}
            </Link>
          )}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              {eyebrow && (
                <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-300">
                  {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}{eyebrow}
                </p>
              )}
              <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{title}</h1>
              {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">{description}</p>}
            </div>
            {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
          </div>
          {children && <div className="mt-6">{children}</div>}
        </div>
        <PhotoCredit photo={image} className="absolute bottom-2 right-2" />
      </header>
    );
  }

  return (
    <header className={cn('border-b border-slate-200 pb-5 dark:border-slate-800', className)}>
      {backTo && (
        <Link to={backTo} className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />{backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}{eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
};

export default PageHeader;
