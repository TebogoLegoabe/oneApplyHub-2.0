import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthBackground from '../components/AuthBackground';

const INPUT = 'w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white';

const ForcedPasswordChangePage = () => {
  const { changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('New password must be at least 8 characters and contain letters and numbers');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);
    if (!result.success) setError(result.error);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <AuthBackground />
      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-600 shadow-sm dark:bg-gold-500/10 dark:text-gold-300">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Set a new password</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your account was created with a temporary password. Choose a new one to continue.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/95 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="h-1 bg-brand-600" />
          <div className="p-5 sm:p-6">
            {error && (
              <div className="mb-4 flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                <input
                  className={INPUT}
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Temporary password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowCurrent((previous) => !previous)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                <input
                  className={INPUT}
                  type={showNew ? 'text' : 'password'}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowNew((previous) => !previous)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                <input
                  className={INPUT}
                  type={showNew ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              <button disabled={loading} className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
                {loading ? 'Updating...' : 'Set new password'}
              </button>
            </form>

            <button onClick={logout} className="mt-4 w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400">
              Log out instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForcedPasswordChangePage;
