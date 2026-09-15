import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import GoogleSignInButton from '../components/GoogleSignInButton';
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

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const { login, verifyMFALogin, googleLogin, sendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Set by ProtectedRoute when a guest hits a private page, and by the reset-password flow.
  const redirectTo = location.state?.from?.pathname;
  const [notice] = useState(location.state?.message || '');

  const goAfterLogin = (user) => {
    if (redirectTo && !redirectTo.startsWith('/admin')) {
      navigate(redirectTo, { replace: true });
      return;
    }
    navigate(user?.is_admin ? '/admin' : '/dashboard', { replace: true });
  };

  const handleGoogleSuccess = async (credential) => {
    setGoogleLoading(true);
    setError('');
    const result = await googleLogin(credential);
    setGoogleLoading(false);
    if (result.success) goAfterLogin(result.user);
    else setError(result.error || 'Google sign-in failed');
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(formData.email, formData.password);
      if (result.success && result.mfa_required) {
        setMfaToken(result.mfa_token);
        setMfaRequired(true);
      } else if (result.success) {
        goAfterLogin(result.user);
      } else if ((result.error || '').toLowerCase().includes('verify your email')) {
        const email = formData.email.trim().toLowerCase();
        const resend = await sendVerificationCode(email);
        if (resend.success) {
          navigate('/verify-email', { replace: true, state: { email } });
        } else {
          setError(resend.error || result.error || 'Please verify your email before signing in.');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = await verifyMFALogin(mfaToken, mfaCode);
    setLoading(false);
    if (result.success) goAfterLogin(result.user);
    else setError(result.error || 'Invalid verification code');
  };

  if (mfaRequired) {
    return (
      <AuthShell
        icon={KeyRound}
        title="Two-factor verification"
        description="Enter the 6-digit code from your authenticator app. Backup codes are also accepted."
        backTo={null}
      >
        {error && <Alert tone="error" className="mb-4">{error}</Alert>}
        <form onSubmit={handleMfaSubmit} className="space-y-4">
          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            autoFocus
            required
            aria-label="Verification code"
            className="text-center font-mono text-2xl tracking-[0.4em]"
            placeholder="000000"
            value={mfaCode}
            onChange={(event) => { setMfaCode(event.target.value.trim()); if (error) setError(''); }}
          />
          <Button type="submit" size="lg" fullWidth loading={loading} disabled={mfaCode.length < 6}>
            Verify and sign in
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={() => { setMfaRequired(false); setMfaCode(''); setError(''); }}>
            Back to login
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      icon={ShieldCheck}
      title="Welcome back"
      description="Sign in to continue to oneApplyHub."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300">
            Create an account
          </Link>
        </>
      }
    >
      {notice && <Alert tone="success" className="mb-4">{notice}</Alert>}
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={setError} loading={googleLoading} label="Continue with Google" />

      <div className="relative my-5" role="separator">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-white px-3 font-medium text-slate-400 dark:bg-slate-900 dark:text-slate-500">or sign in with email</span></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <div>
          <Input
            label="Password"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={formData.password}
            onChange={handleChange}
            required
            trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((previous) => !previous)} />}
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Sign in
          {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
