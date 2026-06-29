import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import logoImg from '../assets/OneHubLogo.png';
import AuthBackground from '../components/AuthBackground';

const PAGE_WRAPPER = 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden';
const CARD = 'bg-white dark:bg-slate-900/95 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden';
const INPUT = 'w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={PAGE_WRAPPER}>
      <AuthBackground />
      <div className="relative z-10 mx-auto w-full max-w-md">
        <Link to="/login" className="mb-4 inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to login
        </Link>

        <div className="mb-6 text-center">
          <img src={logoImg} alt="oneApplyHub logo" className="mx-auto mb-4 h-12 w-12 object-contain" />
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">
            {success ? 'Check your email' : 'Reset your password'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {success ? 'We sent password reset instructions.' : 'Enter your email and we will send reset instructions.'}
          </p>
        </div>

        <div className={CARD}>
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          <div className="p-5 sm:p-6">
            {success ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  We sent a reset link to <span className="font-bold">{email}</span>. The link expires in 1 hour.
                </p>
                <Link to="/login" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                  Back to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email address"
                    className={INPUT}
                  />
                </div>

                <button disabled={loading} className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
