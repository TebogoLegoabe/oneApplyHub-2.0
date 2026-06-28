import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Map, Star, Award, FileText,
  Shield, BadgeCheck, LogOut, Sun, Moon, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Dashboard', exact: true },
  { to: '/properties', icon: Map, label: 'Browse Properties' },
  { to: '/reviews', icon: Star, label: 'Reviews' },
  { to: '/bursaries', icon: Award, label: 'Opportunities Hub' },
  { to: '/application', icon: FileText, label: 'My Application' },
];

const AppSidebar = ({ isOpen, onClose }) => {
  const { user, logout, sendVerificationCode } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'S';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    onClose?.();
  };

  const handleSendVerification = async () => {
    setVerifyLoading(true);
    setVerifyMsg('');
    const result = await sendVerificationCode(user?.email);
    setVerifyLoading(false);
    if (result.success) {
      navigate(`/verify-email?email=${encodeURIComponent(user.email)}`);
      onClose?.();
    } else {
      setVerifyMsg(result.error || 'Failed to send code.');
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside className={`
        fixed lg:sticky inset-y-0 left-0 z-50 lg:z-auto
        w-64 bg-slate-900 flex-shrink-0 flex flex-col border-r border-white/5
        top-0 h-full lg:h-screen overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-white font-bold text-sm tracking-tight">oneApplyHub</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <span className="text-white font-black text-sm tracking-tight">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                {user?.verified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>

          {!user?.verified && (
            <div className="mt-3">
              {verifyMsg && <p className="text-[10px] text-red-400 mb-1.5">{verifyMsg}</p>}
              <button
                onClick={handleSendVerification}
                disabled={verifyLoading}
                className="w-full text-[11px] font-semibold py-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
              >
                {verifyLoading ? 'Sending…' : 'Verify Email'}
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 pb-2">
            Navigation
          </p>

          {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => {
            const active = exact
              ? location.pathname === to
              : location.pathname.startsWith(to) && to !== '/';
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />{label}
              </Link>
            );
          })}

          <div className="pt-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 pb-2">
              Account
            </p>
            <Link
              to="/mfa-setup"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/mfa-setup'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4" />Two-Factor Auth
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                user?.mfa_enabled
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-700 text-slate-500'
              }`}>
                {user?.mfa_enabled ? 'On' : 'Off'}
              </span>
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
