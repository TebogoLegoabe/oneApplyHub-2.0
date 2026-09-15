import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';
import { authAPI } from '../services/api';
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

// Mirrors the server rule (backend/app/utils validate_password) so users see the same message before submitting.
const validatePassword = (password, confirm) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Password must contain at least one letter and one number';
  if (password !== confirm) return 'Passwords do not match';
  return '';
};

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(token ? '' : 'This reset link is invalid or incomplete. Request a new one below.');
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    if (error && token) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validatePassword(formData.password, formData.confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword({ token, password: formData.password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true, state: { message: 'Your password was reset. Sign in with your new password.' } });
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell icon={CheckCircle2} title="Password updated" description="Your password has been changed successfully." backTo={null}>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">Taking you to the sign-in page…</p>
        <Button to="/login" variant="secondary" fullWidth className="mt-5">Go to sign in now</Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      icon={KeyRound}
      title="Choose a new password"
      description="Use at least 8 characters with a mix of letters and numbers."
      backTo="/login"
      backLabel="Back to login"
      footer={
        !token && (
          <Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300">Request a new reset link</Link>
        )
      }
    >
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="New password"
          icon={Lock}
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
          disabled={!token}
          trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((previous) => !previous)} />}
        />
        <Input
          label="Confirm new password"
          icon={Lock}
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          placeholder="Repeat your new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={!token}
          trailing={<PasswordToggle shown={showConfirmPassword} onToggle={() => setShowConfirmPassword((previous) => !previous)} />}
        />
        <Button type="submit" size="lg" fullWidth loading={loading} disabled={!token}>Reset password</Button>
      </form>
    </AuthShell>
  );
};

export default ResetPasswordPage;
