import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, FileText, LayoutDashboard, Shield, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import logoImg from '../../assets/OneHubLogo.png';

const NAV_LINKS = [
  { to: '/properties', label: 'Properties' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/bursaries', label: 'Opportunities' },
];

const UserAvatar = ({ user, size = 'sm' }) => {
  const sizeClass = size === 'md' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs';
  return (
    <div className={cn(sizeClass, 'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 font-bold text-white ring-2 ring-white dark:ring-slate-900')}>
      {user?.profile_picture_url ? (
        <img src={user.profile_picture_url} alt={user?.name || 'Profile'} className="h-full w-full object-cover" />
      ) : (
        <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
      )}
    </div>
  );
};

const desktopLinkClass = ({ isActive }) =>
  cn(
    'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white',
  );

const mobileLinkClass = ({ isActive }) =>
  cn(
    'flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.07]',
  );

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer whenever the route changes (link taps, back button).
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const themeToggle = (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.07] dark:hover:text-white"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5" aria-label="oneApplyHub home">
            <img src={logoImg} alt="" className="h-9 w-9 object-contain" />
            <span className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">oneApplyHub</span>
              <span className="mt-0.5 hidden text-[10px] font-medium text-slate-400 dark:text-slate-500 sm:block">All Your Options. One Platform.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
            {isAuthenticated && (
              <NavLink to="/dashboard" className={desktopLinkClass}>
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />Dashboard
              </NavLink>
            )}
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={desktopLinkClass}>{label}</NavLink>
            ))}
            {isAuthenticated && (
              <NavLink to="/application" className={desktopLinkClass}>
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />Apply
              </NavLink>
            )}
            {isAuthenticated && user?.is_admin && (
              <NavLink to="/admin" className={desktopLinkClass}>
                <Shield className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />Admin
              </NavLink>
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {themeToggle}
            {isAuthenticated ? (
              <>
                <div className="ml-1 flex items-center gap-2.5 border-l border-slate-200 pl-3 dark:border-slate-700">
                  <UserAvatar user={user} />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name?.split(' ')[0]}</p>
                    {user?.verified && <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Verified</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white">
                  Log in
                </Link>
                <Link to="/register" className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            {themeToggle}
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav id="mobile-menu" className="space-y-0.5 border-t border-slate-100 py-3 animate-fade-in dark:border-slate-800 md:hidden" aria-label="Mobile">
            {isAuthenticated && (
              <NavLink to="/dashboard" className={mobileLinkClass}>
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />Dashboard
              </NavLink>
            )}
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={mobileLinkClass}>{label}</NavLink>
            ))}
            {isAuthenticated && (
              <NavLink to="/application" className={mobileLinkClass}>
                <FileText className="h-4 w-4" aria-hidden="true" />Application
              </NavLink>
            )}
            {isAuthenticated && user?.is_admin && (
              <NavLink to="/admin" className={mobileLinkClass}>
                <Shield className="h-4 w-4 text-gold-500" aria-hidden="true" />Admin
              </NavLink>
            )}

            <div className="mt-2 border-t border-slate-100 px-2 pt-3 dark:border-slate-800">
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
                  <Link to="/login" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                    Log in
                  </Link>
                  <Link to="/register" className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                    Sign up free
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
