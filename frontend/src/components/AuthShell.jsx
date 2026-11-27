import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Footprints, GraduationCap, Moon, ShieldCheck, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import Logo from './brand/Logo';

const HIGHLIGHTS = [
  { icon: Footprints, tone: 'bg-lime-300 text-ink-950', title: 'Walking time to campus', text: 'See how far every residence is from Wits and UJ campuses.' },
  { icon: ShieldCheck, tone: 'bg-brand-400 text-ink-950', title: 'Verified listings', text: 'Every property is checked before students can apply.' },
  { icon: BadgeCheck, tone: 'bg-gold-300 text-ink-950', title: 'One application', text: 'Apply to up to three residences and track every decision.' },
];

const BrandPanel = () => (
  <aside className="relative hidden overflow-hidden bg-gradient-to-br from-ink-950 via-brand-900 to-violet-900 p-10 text-white lg:flex lg:flex-col lg:justify-between" aria-label="Why oneApplyHub">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="bg-dots absolute inset-0 opacity-50" />
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-coral-500/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-brand-500/40 blur-3xl" />
    </div>

    <div className="relative">
      <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-white/15">
        <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />Built for Wits &amp; UJ students
      </p>
      <h2 className="mt-6 max-w-md text-4xl font-extrabold leading-tight tracking-tight">
        Your next home, <span className="text-gradient">closer to campus.</span>
      </h2>
      <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
        Compare verified residences, read honest reviews, and know exactly how far you will walk to class.
      </p>
    </div>

    <ul className="relative space-y-3">
      {HIGHLIGHTS.map(({ icon: Icon, tone, title, text }) => (
        <li key={title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tone)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold">{title}</span>
            <span className="mt-0.5 block text-sm text-white/70">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  </aside>
);

/**
 * Shared frame for every authentication screen (login, register, verify, reset, MFA prompt).
 * Keeps the brand mark, back link, heading block and card chrome identical across flows.
 */
const AuthShell = ({ icon: Icon, title, description, backTo = '/', backLabel = 'Back to home', width = 'md', children, footer }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="grid min-h-screen bg-slate-50 dark:bg-slate-950 lg:grid-cols-[1fr_minmax(0,0.9fr)]">
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 lg:hidden" aria-hidden="true">
          <div className="absolute -left-32 -top-32 h-[26rem] w-[26rem] rounded-full bg-brand-200/60 blur-3xl dark:bg-brand-700/25" />
          <div className="absolute -bottom-40 -right-32 h-[24rem] w-[24rem] rounded-full bg-coral-200/50 blur-3xl dark:bg-coral-700/15" />
        </div>

        <div className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link to="/" className="rounded-xl">
            <Logo />
            <span className="sr-only"> home</span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <main id="main-content" className="relative z-10 flex flex-1 items-center px-4 pb-12 pt-2 sm:px-6 lg:px-10">
          <div className={cn('mx-auto w-full', width === 'lg' ? 'max-w-lg' : 'max-w-md')}>
            {backTo && (
              <Link to={backTo} className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                {backLabel}
              </Link>
            )}

            <div className="mb-6">
              {Icon && (
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-glow">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
              )}
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{title}</h1>
              {description && <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
              <div className="h-1.5 bg-gradient-to-r from-brand-500 via-violet-500 to-coral-500" aria-hidden="true" />
              <div className="p-5 sm:p-7">{children}</div>
            </div>

            {footer && <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
          </div>
        </main>
      </div>

      <BrandPanel />
    </div>
  );
};

export default AuthShell;
