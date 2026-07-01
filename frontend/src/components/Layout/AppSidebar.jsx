import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Map, Star, Award, FileText,
  Shield, BadgeCheck, LogOut, Sun, Moon, X,
  Sparkles, ChevronRight, Camera, UserRound, GraduationCap,
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

const Avatar = ({ user, initials, size = 'md' }) => {
  const sizeClass = size === 'lg' ? 'h-20 w-20 rounded-3xl text-xl' : 'h-12 w-12 rounded-2xl text-sm';
  return (
    <div className={`relative ${sizeClass} flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 font-black text-white shadow-lg shadow-indigo-500/25`}>
      {user?.profile_picture_url ? (
        <img src={user.profile_picture_url} alt={user?.name || 'Profile'} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
      <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${user?.verified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
    </div>
  );
};

const ProfileModal = ({ user, initials, onClose, onUpload, onRemove, saving, message }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="text-lg font-black">Profile</h2>
          <p className="text-xs text-slate-400">Update your profile picture</p>
        </div>
        <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close profile">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-5 py-5">
        <div className="flex flex-col items-center text-center">
          <Avatar user={user} initials={initials} size="lg" />
          <h3 className="mt-4 max-w-full truncate text-xl font-black">{user?.name || 'Student'}</h3>
          <p className="mt-1 max-w-full break-all text-sm text-slate-300">{user?.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {user?.verified && <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-black text-sky-200 ring-1 ring-sky-400/20">Verified</span>}
            {user?.year_of_study && <span className="rounded-full bg-indigo-400/15 px-3 py-1 text-xs font-black text-indigo-200 ring-1 ring-indigo-400/20">{user.year_of_study}</span>}
            {user?.faculty && <span className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-black text-blue-200 ring-1 ring-blue-400/20">{user.faculty}</span>}
          </div>
        </div>

        {message && <p className="mt-4 rounded-2xl bg-white/[0.06] px-3 py-2 text-center text-xs font-bold text-slate-200">{message}</p>}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input id="profile-picture-modal-input" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => onUpload(event.target.files?.[0])} />
          <label htmlFor="profile-picture-modal-input" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-600">
            <Camera className="h-4 w-4" />{saving ? 'Saving...' : 'Upload photo'}
          </label>
          <button type="button" onClick={onRemove} disabled={saving || !user?.profile_picture_url} className="rounded-2xl bg-white/[0.08] px-4 py-3 text-sm font-black text-slate-200 transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40">
            Remove photo
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-500">JPG, PNG or WebP. Maximum size 2 MB.</p>
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

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'S';
  const studyLevel = user?.year_of_study;
  const field = user?.faculty;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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

  return (
    <>
      {profileOpen && <ProfileModal user={user} initials={initials} onClose={() => setProfileOpen(false)} onUpload={handleProfileUpload} onRemove={handleRemoveProfilePicture} saving={profileSaving} message={profileMsg} />}
      <div className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

      <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(18rem,86vw)] flex-shrink-0 flex-col border-r border-white/10 bg-slate-950 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.26),transparent_34%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.16),transparent_36%)] transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-72 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:hidden">
          <span className="text-sm font-black tracking-tight text-white">oneApplyHub</span>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 transition-all hover:bg-white/10 hover:text-white" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>

        <div className="shrink-0 px-3 pt-4 pb-3 sm:px-4">
          <button type="button" onClick={() => { setProfileOpen(true); setProfileMsg(''); }} className="w-full rounded-3xl border border-white/10 bg-white/[0.06] p-3 text-left shadow-2xl shadow-indigo-950/30 outline-none backdrop-blur transition hover:border-indigo-300/30 hover:bg-white/[0.08] focus:ring-2 focus:ring-indigo-400/50">
            <div className="flex items-center gap-3">
              <Avatar user={user} initials={initials} />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <p className="truncate text-sm font-black text-white sm:text-base">{user?.name || 'Student'}</p>
                  {user?.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-sky-300" />}
                </div>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-indigo-200/80">Click to update profile</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {studyLevel && <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-200 ring-1 ring-indigo-400/20"><GraduationCap className="h-3 w-3" />{studyLevel}</span>}
              {field && <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-200 ring-1 ring-blue-400/20"><UserRound className="h-3 w-3" />{field}</span>}
            </div>
          </button>

          {!user?.verified && (
            <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-2">
              {verifyMsg && <p className="mb-1.5 text-[10px] text-red-300">{verifyMsg}</p>}
              <button onClick={handleSendVerification} disabled={verifyLoading} className="w-full rounded-xl bg-amber-400/15 px-3 py-2 text-[11px] font-black text-amber-200 transition-colors hover:bg-amber-400/25 disabled:opacity-50">
                {verifyLoading ? 'Sending…' : 'Verify email'}
              </button>
            </div>
          )}
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
          <div className="mb-2 flex items-center justify-between px-2"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Navigation</p><Sparkles className="h-3.5 w-3.5 text-indigo-400/70" /></div>
          <div className="space-y-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => {
              const active = exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/';
              return (
                <Link key={to} to={to} onClick={onClose} className={`group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-bold transition-all sm:py-3 ${active ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:bg-white/[0.07] hover:text-white'}`}>
                  <span className="flex min-w-0 items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-white/15' : 'bg-white/[0.04] group-hover:bg-white/10'}`}><Icon className="h-4 w-4" /></span><span className="truncate">{label}</span></span>
                  <ChevronRight className={`h-3.5 w-3.5 transition ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
                </Link>
              );
            })}
          </div>

          <div className="mt-5">
            <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Account</p>
            <Link to="/mfa-setup" onClick={onClose} className={`flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-bold transition-all sm:py-3 ${location.pathname === '/mfa-setup' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:bg-white/[0.07] hover:text-white'}`}>
              <div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]"><Shield className="h-4 w-4" /></span><span className="truncate">Two-Factor Auth</span></div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-black ${user?.mfa_enabled ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/20' : 'bg-slate-800 text-slate-400 ring-1 ring-white/5'}`}>{user?.mfa_enabled ? 'On' : 'Off'}</span>
            </Link>
          </div>
        </nav>

        <div className="shrink-0 space-y-1 border-t border-white/10 bg-slate-950/70 p-3 sm:p-4">
          <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-400 transition-all hover:bg-white/[0.07] hover:text-white"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04]">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</span>{isDark ? 'Light Mode' : 'Dark Mode'}</button>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-300"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04]"><LogOut className="h-4 w-4" /></span>Log Out</button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
