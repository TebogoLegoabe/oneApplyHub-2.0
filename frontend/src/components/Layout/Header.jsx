import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Award, Briefcase, FileText, LayoutDashboard, LogOut, Menu, Moon, Search, Shield, Star, Sun, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import Logo from '../brand/Logo';

const NAV_LINKS = [
  { to: '/properties', label: 'Find a res', icon: Search, match: (path) => path.startsWith('/properties') },
  { to: '/reviews', label: 'Reviews', icon: Star, match: (path) => path.startsWith('/reviews') },
  { to: '/bursaries', label: 'Bursaries', icon: Award, match: (path) => path.startsWith('/bursaries') },
  { to: '/opportunities', label: 'Internships', icon: Briefcase, match: (path) => path.startsWith('/opportunities') },
];

const ANNOUNCEMENT_KEY = 'oah_announcement_map_v2';

const readDismissed = () => {
  try {
    return localStorage.getItem(ANNOUNCEMENT_KEY) === '1';
  } catch {
    return false;
  }
};

const UserAvatar = ({ user, size = 'sm' }) => {
  const sizeClass = size === 'md' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs';
  return (
    <div className={cn(sizeClass, 'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 font-bold text-white')}>
      {user?.profile_picture_url ? (
        <img src={user.profile_picture_url} alt={user?.name || 'Profile'} className="h-full w-full object-cover" />
      ) : (
        <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
      )}
    </div>
  );
};

const Announcement = ({ onDismiss }) => (
  <div className="relative bg-ink-950 text-white">
    <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-10 py-2 text-center text-xs sm:text-sm">
      <span className="hidden font-semibold text-gold-300 sm:inline">New</span>
      <span className="text-white/90">Walking times from every residence to Wits, UJ and Braamfontein colleges.</span>
      <Link to="/properties" className="inline-flex shrink-0 items-center gap-1 font-semibold text-white underline underline-offset-4 hover:text-gold-300">
        Find a res<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
    <button type="button" onClick={onDismiss} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white" aria-label="Dismiss announcement">
      <X className="h-4 w-4" />
    </button>
  </div>
);

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announcementHidden, setAnnouncementHidden] = useState(readDismissed);

  // Close the drawer whenever the route changes (link taps, back button).
  useEffect(() => { setMobileOpen(false); }, [pathname, search]);

  const dismissAnnouncement = () => {
    setAnnouncementHidden(true);
    try { localStorage.setItem(ANNOUNCEMENT_KEY, '1'); } catch { /* private mode */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = [
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: (path) => path === '/dashboard' }] : []),
    ...NAV_LINKS,
    ...(isAuthenticated ? [{ to: '/application', label: 'Apply', icon: FileText, match: (path) => path === '/application' }] : []),
    ...(isAuthenticated && user?.is_admin ? [{ to: '/admin', label: 'Admin', icon: Shield, match: (path) => path.startsWith('/admin') }] : []),
  ];

  const themeToggle = (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.07] dark:hover:text-white"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );

  return (
    <>
      {!announcementHidden && <Announcement onDismiss={dismissAnnouncement} />}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="rounded-lg">
              <Logo tagline />
              <span className="sr-only"> home</span>
            </Link>

            <nav className="hidden h-16 items-stretch gap-1 lg:flex" aria-label="Primary">
              {links.map(({ to, label, match }) => {
                const active = match(pathname);
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative inline-flex items-center px-3 text-sm font-semibold transition-colors',
                      active ? 'text-brand-700 dark:text-brand-300' : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white',
                    )}
                  >
                    {label}
                    {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-600 dark:bg-brand-400" aria-hidden="true" />}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              {themeToggle}
              {isAuthenticated ? (
                <>
                  <div className="ml-1 flex items-center gap-2.5 border-l border-slate-200 pl-3 dark:border-slate-700">
                    <UserAvatar user={user} />
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name?.split(' ')[0]}</p>
                      {user?.verified && <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Verified</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/[0.07] dark:hover:text-white">
                    Log in
                  </Link>
                  <Link to="/register" className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-coral-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-coral-700">
                    Get started<ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 lg:hidden">
              {themeToggle}
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/[0.07] dark:hover:text-white"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav id="mobile-menu" className="space-y-1 border-t border-slate-100 py-3 animate-fade-in dark:border-slate-800 lg:hidden" aria-label="Mobile">
              {links.map(({ to, label, icon: Icon, match }) => {
                const active = match(pathname);
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                      active ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.07]',
                    )}
                  >
                    <Icon className={cn('h-4 w-4', active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400')} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}

              <div className="mt-2 border-t border-slate-100 px-1 pt-3 dark:border-slate-800">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between gap-3 px-2 py-1">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar user={user} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.verified ? 'Verified account' : 'Unverified account'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />Log out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/login" className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                      Log in
                    </Link>
                    <Link to="/register" className="inline-flex h-11 items-center justify-center rounded-lg bg-coral-600 text-sm font-semibold text-white transition-colors hover:bg-coral-700">
                      Sign up free
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
