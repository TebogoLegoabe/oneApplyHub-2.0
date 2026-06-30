import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Map, Star, Award, FileText,
  Shield, BadgeCheck, LogOut, Sun, Moon, X,
  Sparkles, ChevronRight,
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
  const studyLevel = user?.year_of_study;
  const field = user?.faculty;

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
      navigate('/verify-email', { state: { email: user.email } });
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
        w-64 flex-shrink-0 flex flex-col border-r border-white/10
        top-0 h-full lg:h-screen overflow-y-auto
        bg-slate-950 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.26),transparent_34%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.16),transparent_36%)]
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-white font-black text-sm tracking-tight">oneApplyHub</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 pt-4 pb-3 border-b border-white/10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-indigo-950/30 backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="relative w-11 h-11 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <span className="text-white font-black text-sm tracking-tight">{initials}</span>
                <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 ${user?.verified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-sm font-black text-white truncate">{user?.name || 'Student'}</p>
                  {user?.verified && <BadgeCheck className="w-3.5 h-3.5 text-sky-300 flex-shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {studyLevel && <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-200 ring-1 ring-indigo-400/20">{studyLevel}</span>}
                  {field && <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-200 ring-1 ring-blue-400/20">{field}</span>}
                </div>
              </div>
            </div>

            {!user?.verified && (
              <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-2">
                {verifyMsg && <p className="text-[10px] text-red-300 mb-1.5">{verifyMsg}</p>}
                <button
                  onClick={handleSendVerification}
                  disabled={verifyLoading}
                  className="w-full rounded-lg bg-amber-400/15 px-3 py-1.5 text-[11px] font-black text-amber-200 transition-colors hover:bg-amber-400/25 disabled:opacity-50"
                >
                  {verifyLoading ? 'Sending…' : 'Verify email'}
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Navigation</p>
            <Sparkles className="h-3.5 w-3.5 text-indigo-400/70" />
          </div>

          {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/';
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-xl ${active ? 'bg-white/15' : 'bg-white/[0.04] group-hover:bg-white/10'}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </span>
                  <span className="truncate">{label}</span>
                </span>
                <ChevronRight className={`h-3.5 w-3.5 transition ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
              </Link>
            );
          })}

          <div className="pt-5">
            <p className="px-2 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Account</p>
            <Link
              to="/mfa-setup"
              onClick={onClose}
              className={`flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-bold transition-all ${
                location.pathname === '/mfa-setup'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.05]"><Shield className="w-4 h-4" /></span>
                <span>Two-Factor Auth</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                user?.mfa_enabled ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/20' : 'bg-slate-800 text-slate-400 ring-1 ring-white/5'
              }`}>
                {user?.mfa_enabled ? 'On' : 'Off'}
              </span>
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1 bg-slate-950/60">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.04]">{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</span>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.04]"><LogOut className="w-4 h-4" /></span>
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
