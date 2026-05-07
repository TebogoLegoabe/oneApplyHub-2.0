import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/OneApply-Hub-Logo.png';
import AuthBackground from '../components/AuthBackground';

const RESEND_COOLDOWN = 60; // seconds

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, sendVerificationCode, user } = useAuth();

  // Email can come from registration redirect state, or from the logged-in user
  const email = location.state?.email || user?.email || '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);

  // Start resend cooldown on mount so they can't spam immediately
  useEffect(() => {
    startCooldown();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const startCooldown = () => setCooldown(RESEND_COOLDOWN);

  const handleDigitChange = (index, value) => {
    // Allow only a single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }
    if (!email) {
      setError('Email address not found. Please register again.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await verifyEmail(email, code);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } else {
      setError(result.error || 'Invalid code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    startCooldown();
    setError('');
    await sendVerificationCode(email);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-1">Your account is now active.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <AuthBackground />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <img src={logoImg} alt="oneApplyHub logo" className="h-14 w-14 object-contain" />
          </div>
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Check your inbox</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We sent a 6-digit verification code to
          </p>
          {email && (
            <p className="text-sm font-semibold text-blue-700 mt-1">{email}</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-8 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP digit inputs */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 text-center mb-4">
                Enter verification code
              </label>
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      digit ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="ml-2.5 text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || digits.join('').length < 6}
              className="w-full flex justify-center py-3 px-5 rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          Check your spam folder if you don't see it in your inbox.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
