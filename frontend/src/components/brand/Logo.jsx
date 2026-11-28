import { cn } from '../../utils/cn';

/**
 * Vector version of the oneApplyHub mark (house inside concentric "hub" arcs), flat
 * in the logo blue. Crisp at any size, unlike the 1536x1024 PNG.
 */
export const LogoMark = ({ className, title }) => (
  <svg
    viewBox="0 0 40 40"
    className={cn('h-9 w-9 shrink-0', className)}
    role={title ? 'img' : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
  >
    <rect width="40" height="40" rx="10" fill="#0b66d6" />
    <path d="M8.6 15.4a14.5 14.5 0 0 1 22.8 0" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M12.6 18.5a9.6 9.6 0 0 1 14.8 0" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M13 24.4 20 19.1l7 5.3v6.6a1.2 1.2 0 0 1-1.2 1.2h-3.6v-4.6h-4.4v4.6H14.2a1.2 1.2 0 0 1-1.2-1.2z" fill="#fff" />
  </svg>
);

/** Mark + wordmark. `tone="light"` for dark backgrounds. */
const Logo = ({ className, markClassName, tone = 'default', tagline = false }) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <LogoMark className={markClassName} />
    <span className="flex flex-col leading-none">
      <span className={cn('text-[1.05rem] font-bold tracking-tight', tone === 'light' ? 'text-white' : 'text-ink-950 dark:text-white')}>
        oneApply<span className={tone === 'light' ? 'text-brand-300' : 'text-brand-600 dark:text-brand-400'}>Hub</span>
      </span>
      {tagline && (
        <span aria-hidden="true" className={cn('mt-1 text-[10px] font-medium tracking-wide', tone === 'light' ? 'text-white/60' : 'text-slate-500 dark:text-slate-400')}>
          All your options. One platform.
        </span>
      )}
    </span>
  </span>
);

export default Logo;
