import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Award, BadgeCheck, Building2, Camera, ChevronRight, FileText, GraduationCap, Home, LogOut, Moon, Shield, Star, Sun, UserRound, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import Logo from '../brand/Logo';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Dashboard', match: (path) => path === '/dashboard' },
  { to: '/properties', icon: Building2, label: 'Browse Properties', match: (path) => path.startsWith('/properties') },
  { to: '/reviews', icon: Star, label: 'Reviews', match: (path) => path.startsWith('/reviews') },
  { to: '/bursaries', icon: Award, label: 'Opportunities Hub', match: (path) => path.startsWith('/bursaries') || path.startsWith('/opportunities') },
  { to: '/application', icon: FileText, label: 'My Application', match: (path) => path.startsWith('/application') },
];

const navClass = (active) => cn(
  'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
  active
    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white',
);

const Avatar = ({ user, initials, size = 'md' }) => {
  const sizeClass = size === 'lg' ? 'h-20 w-20 rounded-2xl text-xl' : 'h-11 w-11 rounded-lg text-sm';
  return (
    <div className={cn('relative flex shrink-0 items-center justify-center overflow-hidden bg-brand-600 font-bold text-white', sizeClass)}>
      {user?.profile_picture_url ? (
        <img src={user.profile_picture_url} alt={user?.name || 'Profile'} className="h-full w-full object-cover" />
      ) : (
        <span className="tracking-tight">{initials}</span>
      )}
      <span className={cn('absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900', user?.verified ? 'bg-emerald-500' : 'bg-gold-400')} />
    </div>
  );
};

const ProfileModal = ({ user, initials, onClose, onUpload, onRemove, saving, message }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="profile-title">
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl animate-scale-in dark:border-slate-700 dark:bg-slate-900 dark:text-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 id="profile-title" className="text-base font-bold">Profile</h2>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Close profile">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-5 py-5">
        <div className="flex flex-col items-center text-center">
          <Avatar user={user} initials={initials} size="lg" />
          <p className="mt-4 max-w-full truncate text-xl font-bold">{user?.name || 'Student'}</p>
          <p className="mt-1 max-w-full break-all text-sm text-slate-500 dark:text-slate-300">{user?.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {user?.verified && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/20">Verified</span>}
            {user?.year_of_study && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{user.year_of_study}</span>}
            {user?.faculty && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{user.faculty}</span>}
          </div>
        </div>

        {message && <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-600 dark:bg-white/[0.06] dark:text-slate-200">{message}</p>}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input id="profile-picture-modal-input" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => onUpload(event.target.files?.[0])} />
          <label htmlFor="profile-picture-modal-input" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
            <Camera className="h-4 w-4" aria-hidden="true" />{saving ? 'Saving...' : 'Upload photo'}
          </label>
          <button type="button" onClick={onRemove} disabled={saving || !user?.profile_picture_url} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-white/[0.06]">
            Remove photo
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400">JPG, PNG or WebP. Maximum size 2 MB.</p>
      </div>
    </div>
  </div>
);

const AppSidebar = ({ isOpen, onClose }) => {
  const { user, logout, sendVerificationCode, updateProfilePicture } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
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
      <div className={cn('fixed inset-0 z-40 bg-ink-950/50 transition-opacity duration-300 lg:hidden', isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')} onClick={onClose} aria-hidden="true" />

      <aside className={cn('fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(18rem,86vw)] shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-72 lg:translate-x-0', isOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <Link to="/" onClick={onClose} className="rounded-lg"><Logo /><span className="sr-only"> home</span></Link>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white lg:hidden" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>

        <div className="shrink-0 px-3 pb-3 pt-2 sm:px-4">
          <button type="button" onClick={() => { setProfileOpen(true); setProfileMsg(''); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]">
            <div className="flex items-center gap-3">
              <Avatar user={user} initials={initials} />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'Student'}</p>
                  {user?.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-label="Verified" />}
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Manage profile</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            </div>
            {(user?.year_of_study || user?.faculty) && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {user?.year_of_study && <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"><GraduationCap className="h-3 w-3" aria-hidden="true" />{user.year_of_study}</span>}
                {user?.faculty && <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"><UserRound className="h-3 w-3" aria-hidden="true" />{user.faculty}</span>}
              </div>
            )}
          </button>

          {!user?.verified && (
            <div className="mt-3 rounded-lg border border-gold-200 bg-gold-50 p-2 dark:border-gold-400/20 dark:bg-gold-400/10">
              {verifyMsg && <p className="mb-1.5 text-[11px] text-red-600 dark:text-red-300">{verifyMsg}</p>}
              <button type="button" onClick={handleSendVerification} disabled={verifyLoading} className="w-full rounded-md bg-white px-3 py-2 text-xs font-semibold text-gold-800 ring-1 ring-gold-200 transition-colors hover:bg-gold-100 disabled:opacity-50 dark:bg-transparent dark:text-gold-200">
                {verifyLoading ? 'Sending…' : 'Verify email'}
              </button>
            </div>
          )}
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4" aria-label="Main">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Navigation</p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map(({ to, icon: Icon, label, match }) => {
              const active = match(location.pathname);
              return (
                <Link key={to} to={to} onClick={onClose} aria-current={active ? 'page' : undefined} className={navClass(active)}>
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200')} aria-hidden="true" />
                    <span className="truncate">{label}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-5">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Account</p>
            <Link to="/mfa-setup" onClick={onClose} aria-current={mfaActive ? 'page' : undefined} className={navClass(mfaActive)}>
              <span className="flex min-w-0 items-center gap-3">
                <Shield className={cn('h-4 w-4 shrink-0', mfaActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400')} aria-hidden="true" />
                <span className="truncate">Two-Factor Auth</span>
              </span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', user?.mfa_enabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')}>{user?.mfa_enabled ? 'On' : 'Off'}</span>
            </Link>
          </div>
        </nav>

        <div className="shrink-0 space-y-0.5 border-t border-slate-100 p-3 dark:border-slate-800 sm:p-4">
          <button type="button" onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white">
            {isDark ? <Sun className="h-4 w-4 text-slate-400" aria-hidden="true" /> : <Moon className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300">
            <LogOut className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
