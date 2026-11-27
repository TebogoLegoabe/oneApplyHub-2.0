import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Award, BadgeCheck, Building2, Camera, ChevronRight, FileText, GraduationCap, Home, LogOut, Map, Moon, Shield, Star, Sun, UserRound, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import Logo from '../brand/Logo';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Dashboard', tone: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300', match: (path) => path === '/dashboard' },
  { to: '/properties', icon: Building2, label: 'Browse Properties', tone: 'bg-coral-100 text-coral-700 dark:bg-coral-500/15 dark:text-coral-300', match: (path, view) => path.startsWith('/properties') && view !== 'map' },
  { to: '/properties?view=map', icon: Map, label: 'Residence map', tone: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300', match: (path, view) => path === '/properties' && view === 'map' },
  { to: '/reviews', icon: Star, label: 'Reviews', tone: 'bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300', match: (path) => path.startsWith('/reviews') },
  { to: '/bursaries', icon: Award, label: 'Opportunities Hub', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', match: (path) => path.startsWith('/bursaries') || path.startsWith('/opportunities') },
  { to: '/application', icon: FileText, label: 'My Application', tone: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300', match: (path) => path.startsWith('/application') },
];

const Avatar = ({ user, initials, size = 'md' }) => {
  const sizeClass = size === 'lg' ? 'h-20 w-20 rounded-2xl text-xl' : 'h-12 w-12 rounded-xl text-sm';
  return (
    <div className={cn('relative flex shrink-0 items-center justify-center overflow-hidden font-bold text-white shadow-sm', sizeClass, user?.profile_picture_url ? 'bg-brand-700' : 'bg-gradient-to-br from-brand-500 via-violet-500 to-coral-500')}>
      {user?.profile_picture_url ? (
        <img src={user.profile_picture_url} alt={user?.name || 'Profile'} className="h-full w-full object-cover" />
      ) : (
        <span className="tracking-tight">{initials}</span>
      )}
      <span className={cn('absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900', user?.verified ? 'bg-lime-400' : 'bg-gold-400')} />
    </div>
  );
};

const ProfileModal = ({ user, initials, onClose, onUpload, onRemove, saving, message }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="profile-title">
    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl animate-scale-in dark:border-slate-700 dark:bg-slate-900 dark:text-white">
      <div className="relative h-20 bg-gradient-to-r from-brand-600 via-violet-600 to-coral-500">
        <div className="bg-dots absolute inset-0" aria-hidden="true" />
        <button type="button" onClick={onClose} className="absolute right-3 top-3 rounded-xl p-2 text-white/80 hover:bg-white/15 hover:text-white" aria-label="Close profile">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="-mt-10 px-5 pb-5">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-2xl ring-4 ring-white dark:ring-slate-900"><Avatar user={user} initials={initials} size="lg" /></div>
          <h2 id="profile-title" className="mt-4 max-w-full truncate text-xl font-bold">{user?.name || 'Student'}</h2>
          <p className="mt-1 max-w-full break-all text-sm text-slate-500 dark:text-slate-300">{user?.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {user?.verified && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/20">Verified</span>}
            {user?.year_of_study && <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-200 dark:bg-brand-400/15 dark:text-brand-200 dark:ring-brand-400/20">{user.year_of_study}</span>}
            {user?.faculty && <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-200 dark:bg-violet-400/15 dark:text-violet-200 dark:ring-violet-400/20">{user.faculty}</span>}
          </div>
        </div>

        {message && <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-bold text-slate-600 dark:bg-white/[0.06] dark:text-slate-200">{message}</p>}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input id="profile-picture-modal-input" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => onUpload(event.target.files?.[0])} />
          <label htmlFor="profile-picture-modal-input" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700">
            <Camera className="h-4 w-4" aria-hidden="true" />{saving ? 'Saving...' : 'Upload photo'}
          </label>
          <button type="button" onClick={onRemove} disabled={saving || !user?.profile_picture_url} className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.12]">
            Remove photo
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-400 dark:text-slate-500">JPG, PNG or WebP. Maximum size 2 MB.</p>
      </div>
    </div>
  </div>
);

const AppSidebar = ({ isOpen, onClose }) => {
  const { user, logout, sendVerificationCode, updateProfilePicture } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const view = new URLSearchParams(location.search).get('view');
  const navigate = useNavigate();
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'S';

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
    onClose?.();
  };

  const handleProfileUpload = (file) => {
    setProfileMsg('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setProfileMsg('Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg('Image must be under 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setProfileSaving(true);
      const result = await updateProfilePicture(reader.result);
      setProfileSaving(false);
      setProfileMsg(result.success ? 'Profile picture updated.' : result.error);
    };
    reader.onerror = () => setProfileMsg('Could not read image.');
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = async () => {
    setProfileSaving(true);
    setProfileMsg('');
    const result = await updateProfilePicture(null);
    setProfileSaving(false);
    setProfileMsg(result.success ? 'Profile picture removed.' : result.error);
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

  const mfaActive = location.pathname === '/mfa-setup';

  return (
    <>
      {profileOpen && <ProfileModal user={user} initials={initials} onClose={() => setProfileOpen(false)} onUpload={handleProfileUpload} onRemove={handleRemoveProfilePicture} saving={profileSaving} message={profileMsg} />}
      <div className={cn('fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden', isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')} onClick={onClose} aria-hidden="true" />

      <aside className={cn('fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(18rem,86vw)] shrink-0 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-72 lg:translate-x-0', isOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <Link to="/" onClick={onClose} className="rounded-xl"><Logo /><span className="sr-only"> home</span></Link>
          <button type="button" onClick={onClose} className="rounded-xl p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white lg:hidden" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>

        <div className="shrink-0 px-3 pb-3 pt-2 sm:px-4">
          <button type="button" onClick={() => { setProfileOpen(true); setProfileMsg(''); }} className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-ink-950 via-brand-900 to-violet-900 p-3 text-left text-white shadow-float outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand-400">
            <div className="bg-dots absolute inset-0 opacity-40" aria-hidden="true" />
            <div className="relative flex items-center gap-3">
              <Avatar user={user} initials={initials} />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <p className="truncate text-sm font-bold sm:text-base">{user?.name || 'Student'}</p>
                  {user?.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-lime-300" aria-label="Verified" />}
                </div>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/60">Manage profile</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/60" aria-hidden="true" />
            </div>
            {(user?.year_of_study || user?.faculty) && (
              <div className="relative mt-3 flex flex-wrap gap-1.5">
                {user?.year_of_study && <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold"><GraduationCap className="h-3 w-3" aria-hidden="true" />{user.year_of_study}</span>}
                {user?.faculty && <span className="inline-flex items-center gap-1 rounded-full bg-gold-300 px-2 py-0.5 text-[10px] font-bold text-ink-950"><UserRound className="h-3 w-3" aria-hidden="true" />{user.faculty}</span>}
              </div>
            )}
          </button>

          {!user?.verified && (
            <div className="mt-3 rounded-xl border border-gold-200 bg-gold-50 p-2 dark:border-gold-400/20 dark:bg-gold-400/10">
              {verifyMsg && <p className="mb-1.5 text-[11px] text-red-600 dark:text-red-300">{verifyMsg}</p>}
              <button type="button" onClick={handleSendVerification} disabled={verifyLoading} className="w-full rounded-lg bg-gold-300 px-3 py-2 text-xs font-bold text-ink-950 transition-colors hover:bg-gold-200 disabled:opacity-50">
                {verifyLoading ? 'Sending…' : 'Verify email'}
              </button>
            </div>
          )}
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4" aria-label="Main">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Navigation</p>
          <div className="space-y-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label, tone, match }) => {
              const active = match(location.pathname, view);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group flex items-center justify-between rounded-xl px-2.5 py-2 text-sm font-semibold transition-all',
                    active
                      ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-glow'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', active ? 'bg-white/20 text-white' : tone)}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="truncate">{label}</span>
                  </span>
                  <ChevronRight className={cn('h-3.5 w-3.5 transition', active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60')} aria-hidden="true" />
                </Link>
              );
            })}
          </div>

          <div className="mt-5">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Account</p>
            <Link to="/mfa-setup" onClick={onClose} aria-current={mfaActive ? 'page' : undefined} className={cn('flex items-center justify-between rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors', mfaActive ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white')}>
              <span className="flex min-w-0 items-center gap-3">
                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', mfaActive ? 'bg-white/20' : 'bg-slate-100 text-slate-600 dark:bg-white/[0.05] dark:text-slate-300')}><Shield className="h-4 w-4" aria-hidden="true" /></span>
                <span className="truncate">Two-Factor Auth</span>
              </span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', user?.mfa_enabled ? 'bg-lime-200 text-lime-900' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400')}>{user?.mfa_enabled ? 'On' : 'Off'}</span>
            </Link>
          </div>
        </nav>

        <div className="shrink-0 space-y-1 border-t border-slate-100 p-3 dark:border-slate-800 sm:p-4">
          <button type="button" onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.05]">{isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}</span>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.05]"><LogOut className="h-4 w-4" aria-hidden="true" /></span>
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
