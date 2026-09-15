import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/OneHubLogo.png';
import { cn } from '../utils/cn';

/**
 * Shared frame for every authentication screen (login, register, verify, reset, MFA prompt).
 * Keeps the brand mark, back link, heading block and card chrome identical across flows.
 */
const AuthShell = ({ icon: Icon, title, description, backTo = '/', backLabel = 'Back to home', width = 'md', children, footer }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-200/50 blur-3xl dark:bg-brand-700/20" />
        <div className="absolute -bottom-40 -right-32 h-[26rem] w-[26rem] rounded-full bg-gold-200/40 blur-3xl dark:bg-gold-700/10" />
      </div>

      <div className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5" aria-label="oneApplyHub home">
          <img src={logoImg} alt="" className="h-9 w-9 object-contain" />
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">oneApplyHub</span>
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

      <main className="relative z-10 flex flex-1 items-center px-4 pb-12 pt-2 sm:px-6 lg:px-8">
        <div className={cn('mx-auto w-full', width === 'lg' ? 'max-w-lg' : 'max-w-md')}>
          {backTo && (
            <Link to={backTo} className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {backLabel}
            </Link>
          )}

          <div className="mb-6 text-center">
            {Icon && (
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-sm ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/20">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h1>
            {description && <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
            <div className="h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-gold-400" aria-hidden="true" />
            <div className="p-5 sm:p-6">{children}</div>
          </div>

          {footer && <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
        </div>
      </main>
    </div>
  );
};

export default AuthShell;
