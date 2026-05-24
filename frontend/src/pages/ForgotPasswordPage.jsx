import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import logoImg from '../assets/OneHubLogo.png';
import AuthBackground from '../components/AuthBackground';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const wrapper = 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden';

  if (success) {
    return (
      <div className={wrapper}>
        <AuthBackground />
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white dark:bg-gray-900 py-12 px-8 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Check Your Email</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              We sent a reset link to
            </p>
            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-6">{email}</p>
            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
              Click the link in that email to reset your password. It expires in 1 hour.
            </p>
            <Link to="/login"
              className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-blue-600 dark:hover:bg-blue-600 text-white dark:text-slate-900 dark:hover:text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <AuthBackground />
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">

        <div className="mb-5">
          <Link to="/login"
            className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Login
          </Link>
        </div>

        <div className="text-center mb-8">
          <img src={logoImg} alt="oneApplyHub" className="h-12 w-12 object-contain mx-auto mb-5" />
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 py-8 px-8 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Sending…</>
              ) : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
