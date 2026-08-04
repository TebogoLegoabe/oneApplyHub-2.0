import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import AuthBackground from '../components/AuthBackground';
import GoogleSignInButton from '../components/GoogleSignInButton';

const PAGE = 'min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden';
const CARD = 'bg-white dark:bg-slate-900/95 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden';
const INPUT = 'w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white';

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

  const goAfterLogin = (user) => navigate(user?.is_admin ? '/admin' : '/dashboard', { replace: true });

  const handleGoogleSuccess = async (credential) => {
    setGoogleLoading(true);
    setError('');
    const result = await googleLogin(credential);
    setGoogleLoading(false);
    result.success ? goAfterLogin(result.user) : setError(result.error || 'Google sign-in failed');
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
    if (result.success) {
      goAfterLogin(result.user);
    } else {
      setError(result.error || 'Invalid verification code');
    }
  };

  return (
    <div className={PAGE}>
      <AuthBackground />
      <div className="relative z-10 mx-auto w-full max-w-md">
        <Link to="/" className="mb-4 inline-flex items-center text-xs font-bold text-slate-500 hover:text-brand-600 dark:text-slate-400">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to home
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-sm dark:bg-brand-500/10 dark:text-brand-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            {mfaRequired ? 'Two-factor check' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {mfaRequired ? 'Enter your authenticator or backup code.' : 'Sign in to continue to oneApplyHub.'}
          </p>
        </div>

        <div className={CARD}>
          <div className="h-1 bg-brand-600" />
          <div className="p-5 sm:p-6">
            {error && (
              <div className="mb-4 flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {mfaRequired ? (
              <form onSubmit={handleMfaSubmit} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  autoFocus
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center font-mono text-2xl tracking-widest text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(event) => { setMfaCode(event.target.value); if (error) setError(''); }}
                />
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">Backup codes are also accepted.</p>
                <button disabled={loading || mfaCode.length < 6} className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify and sign in'}
                </button>
                <button type="button" onClick={() => { setMfaRequired(false); setMfaCode(''); setError(''); }} className="w-full text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400">
                  Back to login
                </button>
              </form>
            ) : (
              <>
                <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={setError} loading={googleLoading} label="Continue with Google" />
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-3 font-bold text-slate-400 dark:bg-slate-900">or sign in with email</span></div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                    <input className={INPUT} type="email" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                    <input className={INPUT} type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    <button type="button" onClick={() => setShowPassword((previous) => !previous)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="text-right"><Link to="/forgot-password" className="text-xs font-bold text-brand-600 hover:text-brand-700">Forgot password?</Link></div>
                  <button disabled={loading} className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>
                <Link to="/register" className="mt-4 flex items-center justify-center rounded-xl border border-brand-200 px-5 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50 dark:border-brand-900 dark:text-brand-300">
                  Create an account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
