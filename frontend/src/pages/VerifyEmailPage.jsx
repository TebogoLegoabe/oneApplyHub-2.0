import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Mail, RefreshCw, MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import { Alert, Button, Input } from '../components/ui';
import { cn } from '../utils/cn';

const RESEND_COOLDOWN = 60; // seconds
const CODE_LENGTH = 6;
const EMPTY_CODE = Array(CODE_LENGTH).fill('');

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, sendVerificationCode, user } = useAuth();

  const initialEmail = location.state?.email || user?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(EMPTY_CODE);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (initialEmail) setCooldown(RESEND_COOLDOWN);
  }, [initialEmail]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...EMPTY_CODE];
    pasted.split('').forEach((char, index) => { next[index] = char; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
    event.preventDefault();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }
    if (!email) {
      setError('Enter the email address you registered with.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await verifyEmail(email, code);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true, state: { message: 'Email verified. You can now sign in.' } }), 2000);
    } else {
      setError(result.error || 'Invalid code. Please try again.');
      setDigits(EMPTY_CODE);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setError('');
    setResent(false);
    const result = await sendVerificationCode(email);
    if (result.success) {
      setCooldown(RESEND_COOLDOWN);
      setResent(true);
    } else {
      setError(result.error || 'Failed to send code. Please try again.');
    }
  };

  if (success) {
    return (
      <AuthShell icon={CheckCircle2} title="Email verified" description="Your account is now active." backTo={null}>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">Taking you to the sign-in page…</p>
        <Button to="/login" variant="secondary" fullWidth className="mt-5">Go to sign in now</Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      icon={MailCheck}
      title="Check your inbox"
      description={initialEmail ? 'We sent a 6-digit verification code to' : 'Enter your account email to receive a verification code.'}
      backTo="/login"
      backLabel="Back to login"
      footer={<span className="text-xs">Can't find it? Check your spam or promotions folder.</span>}
    >
      {initialEmail && (
        <p className="-mt-2 mb-5 text-center text-sm font-semibold text-brand-700 dark:text-brand-300">{email}</p>
      )}

      {resent && !error && <Alert tone="success" className="mb-4" onDismiss={() => setResent(false)}>A new code has been sent.</Alert>}
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!initialEmail && (
          <Input
            label="Email address"
            icon={Mail}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value.trim().toLowerCase())}
            placeholder="you@example.com"
            required
          />
        )}

        <fieldset>
          <legend className="mb-3 block text-center text-xs font-semibold text-slate-700 dark:text-slate-300">Verification code</legend>
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => { inputRefs.current[index] = element; }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                value={digit}
                onChange={(event) => handleDigitChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                aria-label={`Digit ${index + 1}`}
                autoFocus={index === 0 && Boolean(initialEmail)}
                className={cn(
                  'h-14 w-11 rounded-xl border-2 text-center text-xl font-bold outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:w-12',
                  digit
                    ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-200'
                    : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
                )}
              />
            ))}
          </div>
        </fieldset>

        <Button type="submit" size="lg" fullWidth loading={loading} disabled={digits.join('').length < CODE_LENGTH}>
          Verify email
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-1 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Didn't receive the code?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || !email}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-brand-300 dark:disabled:text-slate-500"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          {cooldown > 0 ? `Resend in ${cooldown}s` : initialEmail ? 'Resend code' : 'Send code'}
        </button>
      </div>

      {!initialEmail && (
        <p className="mt-5 border-t border-slate-100 pt-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300">Create one</Link>
        </p>
      )}
    </AuthShell>
  );
};

export default VerifyEmailPage;
