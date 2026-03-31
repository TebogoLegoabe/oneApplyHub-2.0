import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import logoImg from '../assets/OneApply-Hub-Logo.png';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCallback,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoogleCallback = async ({ credential }) => {
    setGoogleLoading(true);
    setError('');
    const result = await googleLogin(credential);
    setGoogleLoading(false);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Google sign-in failed');
    }
  };

  const handleGoogleSignIn = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) {
      setError('Google sign-in is not configured. Please use email and password.');
      return;
    }
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One Tap was suppressed — fall back to explicit popup
        window.google.accounts.id.renderButton(
          document.createElement('div'),
          { theme: 'outline', size: 'large' }
        );
      }
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <img src={logoImg} alt="oneApplyHub logo" className="h-14 w-14 object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to your oneApplyHub account</p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-8 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {googleLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">or sign in with email</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                University Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 transition-all"
                  placeholder="1234567@students.wits.ac.za"
                  value={formData.email} onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" required
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 transition-all"
                  placeholder="Enter your password"
                  value={formData.password} onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-blue-500 focus:outline-none transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link to="/verify-email" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                Need to verify email?
              </Link>
              <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-5 rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <Link
              to="/register"
              className="w-full flex items-center justify-center py-3 px-5 border-2 border-blue-600 rounded-xl text-sm text-blue-600 font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 group"
            >
              Create an account
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              Accepted: @students.wits.ac.za &middot; @student.uj.ac.za
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
