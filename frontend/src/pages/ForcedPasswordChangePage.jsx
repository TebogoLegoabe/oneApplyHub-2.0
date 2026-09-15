import { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import { Alert, Button, Input } from '../components/ui';

const PasswordToggle = ({ shown, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
    aria-label={shown ? 'Hide password' : 'Show password'}
  >
    {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
);

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
      setError('New password must be at least 8 characters and contain letters and numbers.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);
    if (!result.success) setError(result.error);
  };

  return (
    <AuthShell
      icon={ShieldAlert}
      title="Set a new password"
      description="Your account was created with a temporary password. Choose your own to continue."
      backTo={null}
      footer={
        <button type="button" onClick={logout} className="font-semibold text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          Log out instead
        </button>
      }
    >
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Temporary password"
          icon={Lock}
          type={showCurrent ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="The password you were given"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
          trailing={<PasswordToggle shown={showCurrent} onToggle={() => setShowCurrent((previous) => !previous)} />}
        />
        <Input
          label="New password"
          icon={Lock}
          type={showNew ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          trailing={<PasswordToggle shown={showNew} onToggle={() => setShowNew((previous) => !previous)} />}
        />
        <Input
          label="Confirm new password"
          icon={Lock}
          type={showNew ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>Set new password</Button>
      </form>
    </AuthShell>
  );
};

export default ForcedPasswordChangePage;
