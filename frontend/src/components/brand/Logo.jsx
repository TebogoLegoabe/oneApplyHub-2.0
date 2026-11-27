import { useId } from 'react';
import { cn } from '../../utils/cn';

/**
 * Vector version of the oneApplyHub mark (house inside concentric "hub" arcs).
 * Crisp at any size, unlike the 1536x1024 PNG which shrinks to a grey smudge.
 */
export const LogoMark = ({ className, title }) => {
  const gradientId = `logo-gradient-${useId().replace(/:/g, '')}`;
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('h-9 w-9 shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradientId} x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f80fb" />
          <stop offset="0.55" stopColor="#0b66d6" />
          <stop offset="1" stopColor="#1d2259" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill={`url(#${gradientId})`} />
      <path d="M8.6 15.2a14.5 14.5 0 0 1 22.8 0" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12.6 18.3a9.6 9.6 0 0 1 14.8 0" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M13 24.2 20 18.9l7 5.3v6.6a1.2 1.2 0 0 1-1.2 1.2h-3.6v-4.6h-4.4V32H14.2a1.2 1.2 0 0 1-1.2-1.2z" fill="#fff" />
      <circle cx="31.5" cy="31.5" r="3.2" fill="#fb5a33" stroke="#fff" strokeWidth="1.6" />
    </svg>
  );
};

/** Mark + wordmark. `tone="light"` for dark backgrounds. */
const Logo = ({ className, markClassName, tone = 'default', tagline = false }) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <LogoMark className={markClassName} />
    <span className="flex flex-col leading-none">
      <span className={cn('font-display text-[1.05rem] font-extrabold tracking-tight', tone === 'light' ? 'text-white' : 'text-ink-950 dark:text-white')}>
        oneApply<span className={tone === 'light' ? 'text-brand-300' : 'text-brand-600 dark:text-brand-400'}>Hub</span>
      </span>
      {tagline && (
        <span aria-hidden="true" className={cn('mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]', tone === 'light' ? 'text-white/60' : 'text-slate-500 dark:text-slate-400')}>
          All your options. One platform.
        </span>
      )}
    </span>
  </span>
);

export default Logo;
