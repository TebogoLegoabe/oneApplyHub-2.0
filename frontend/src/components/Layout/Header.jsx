import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, FileText, LayoutDashboard, Shield, Sun, Moon } from 'lucide-react';
import logoImg from '../../assets/OneHubLogo.png';
import { useTheme } from '../../context/ThemeContext';

const NAV_LINKS = [
  { to: '/properties', label: 'Properties' },
  { to: '/reviews',    label: 'Reviews'    },
  { to: '/bursaries',  label: 'OpportunitiesHub'  },
];

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActive = (to) => pathname === to || (to !== '/' && pathname.startsWith(to));

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition-all"
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );

  const navLinkClass = (to) =>
    `px-3 py-2 rounded-lg font-medium text-sm transition-all ${
      isActive(to)
        ? 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700'
    }`;

  const mobileNavLinkClass = (to) =>
    `block py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
      isActive(to)
        ? 'text-blue-700 bg-blue-50'
        : 'text-slate-700 hover:bg-slate-50'
    }`;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={closeMobileMenu}>
            <img src={logoImg} alt="oneApplyHub logo" className="h-12 w-12 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">oneApplyHub</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium -mt-0.5 hidden sm:block">All Your Options. One Platform.</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {isAuthenticated && (
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                <span className="flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" />Dashboard
                </span>
              </Link>
            )}
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className={navLinkClass(to)}>{label}</Link>
            ))}
            {isAuthenticated && (
              <Link to="/application" className={navLinkClass('/application')}>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />Apply
                </span>
              </Link>
            )}
            {isAuthenticated && user?.is_admin && (
              <Link to="/admin" className={navLinkClass('/admin')}>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />Admin
                </span>
              </Link>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-white font-bold text-xs">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="leading-none">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name?.split(' ')[0]}</p>
                    {user?.verified && <p className="text-[10px] text-emerald-600 font-medium">Verified</p>}
                  </div>
                </div>
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition-all"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 space-y-0.5">
            {isAuthenticated && (
              <Link to="/dashboard" className={mobileNavLinkClass('/dashboard')} onClick={closeMobileMenu}>
                <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" />Dashboard</span>
              </Link>
            )}
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className={mobileNavLinkClass(to)} onClick={closeMobileMenu}>{label}</Link>
            ))}
            {isAuthenticated && (
              <Link to="/application" className={mobileNavLinkClass('/application')} onClick={closeMobileMenu}>
                <span className="flex items-center gap-2"><FileText className="w-4 h-4" />Application</span>
              </Link>
            )}
            {isAuthenticated && user?.is_admin && (
              <Link to="/admin" className={mobileNavLinkClass('/admin')} onClick={closeMobileMenu}>
                <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-amber-500" />Admin</span>
              </Link>
            )}

            <div className="pt-3 mt-1 border-t border-slate-100 dark:border-slate-700 px-2">
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-2 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{user?.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[160px]">{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all border border-red-100">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="block text-center py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 transition-all" onClick={closeMobileMenu}>
                    Login
                  </Link>
                  <Link to="/register" className="block text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors" onClick={closeMobileMenu}>
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
