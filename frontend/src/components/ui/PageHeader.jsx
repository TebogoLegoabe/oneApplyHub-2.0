import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

/* Every gradient starts at a 700-level stop so white body text passes WCAG AA. */
const TONES = {
  brand: 'from-brand-700 via-brand-800 to-ink-900',
  coral: 'from-coral-700 via-rose-700 to-fuchsia-800',
  violet: 'from-violet-700 via-indigo-700 to-brand-800',
  emerald: 'from-emerald-700 via-teal-700 to-cyan-800',
  gold: 'from-gold-700 via-orange-700 to-coral-700',
  ink: 'from-ink-950 via-ink-900 to-brand-900',
};

const GLOWS = {
  brand: 'bg-brand-400/40',
  coral: 'bg-gold-400/40',
  violet: 'bg-fuchsia-400/40',
  emerald: 'bg-lime-300/35',
  gold: 'bg-gold-300/40',
  ink: 'bg-violet-500/35',
};

/**
 * Colourful page intro: optional back link, eyebrow pill, title, description,
 * a right-aligned action slot, and `children` for extra content (e.g. quick stats).
 */
const PageHeader = ({ eyebrow, icon: Icon, title, description, action, backTo, backLabel = 'Back', tone = 'brand', className, children }) => (
  <header className={cn('relative isolate overflow-hidden rounded-3xl bg-gradient-to-br px-5 py-6 text-white shadow-float sm:px-8 sm:py-8', TONES[tone] || TONES.brand, className)}>
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div className="bg-dots absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
      <div className={cn('absolute -right-16 -top-24 h-64 w-64 rounded-full blur-3xl', GLOWS[tone] || GLOWS.brand)} />
      <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      {Icon && <Icon className="absolute -bottom-6 right-6 hidden h-40 w-40 rotate-[-8deg] text-white/[0.07] sm:block" strokeWidth={1.25} />}
    </div>

    {backTo && (
      <Link to={backTo} className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/20">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        {backLabel}
      </Link>
    )}
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur">
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
    {children && <div className="mt-6">{children}</div>}
  </header>
);

export default PageHeader;
