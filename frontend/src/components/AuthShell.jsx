import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PHOTOS } from '../constants/photos';
import { cn } from '../utils/cn';
import Logo from './brand/Logo';
import PhotoCredit from './ui/PhotoCredit';

const HIGHLIGHTS = [
  'Walking times from every residence to Wits, UJ and Braamfontein colleges',
  'Listings checked by our team, with NSFAS-accredited options',
  'One application for up to three residences, tracked in one place',
];

const PhotoPanel = () => {
  const photo = PHOTOS.witsGreatHallTrees;
  return (
    <aside className="relative hidden overflow-hidden bg-ink-950 lg:block" aria-label="Why oneApplyHub">
      <img src={photo.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/10" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-10 text-white xl:p-14">
        <p className="text-sm font-semibold text-gold-300">For Wits, UJ and college students in Johannesburg</p>
        <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-tight xl:text-4xl">Your next home, closer to campus.</h2>
        <ul className="mt-6 max-w-md space-y-3">
          {HIGHLIGHTS.map((text) => (
            <li key={text} className="flex items-start gap-3 text-sm leading-relaxed text-white/90">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
        <PhotoCredit photo={photo} className="mt-8 inline-block" />
      </div>
    </aside>
  );
};

/**
 * Shared frame for every authentication screen (login, register, verify, reset, MFA prompt):
 * a clean form column beside a photo panel on large screens.
 */
const AuthShell = ({ title, description, backTo = '/', backLabel = 'Back to home', width = 'md', children, footer }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="grid min-h-screen bg-white dark:bg-slate-950 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link to="/" className="rounded-lg">
            <Logo />
            <span className="sr-only"> home</span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <main id="main-content" className="flex flex-1 items-center px-6 pb-10 sm:px-10">
          <div className={cn('mx-auto w-full', width === 'lg' ? 'max-w-lg' : 'max-w-md')}>
            {backTo && (
              <Link to={backTo} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {backLabel}
              </Link>
            )}

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h1>
            {description && <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>}

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">{footer}</div>}
          </div>
        </main>

        <p className="px-6 pb-6 text-xs text-slate-500 dark:text-slate-400 sm:px-10">
          &copy; {new Date().getFullYear()} oneApplyHub ·{' '}
          <Link to="/privacy" className="hover:text-slate-800 dark:hover:text-slate-200">Privacy</Link> ·{' '}
          <Link to="/terms" className="hover:text-slate-800 dark:hover:text-slate-200">Terms</Link>
        </p>
      </div>

      <PhotoPanel />
    </div>
  );
};

export default AuthShell;
