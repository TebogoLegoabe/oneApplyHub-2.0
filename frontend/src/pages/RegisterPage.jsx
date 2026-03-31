import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, User, GraduationCap, Building,
  Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, UserPlus,
} from 'lucide-react';
import logoImg from '../assets/OneApply-Hub-Logo.png';

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Honours', 'Masters', 'PhD', 'Other'];
const FACULTY_OPTIONS = [
  'Engineering', 'Commerce', 'Law', 'Health Sciences',
  'Humanities', 'Science', 'Education', 'Management', 'Art & Design', 'Other',
];

// Inline Google "G" icon (no extra package needed)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    year_of_study: '', faculty: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const handleGoogleCallback = async ({ credential }) => {
    setGoogleLoading(true);
    setError('');
    const result = await googleLogin(credential);
    setGoogleLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Google sign-in failed');
    }
  };

  // Initialise Google Identity Services and render the real button into a hidden container
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google || !googleButtonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCallback,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: googleButtonRef.current.offsetWidth || 400,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoogleSignIn = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) {
      setError('Google sign-in is not available. Please use email registration.');
      return;
    }
    const btn = googleButtonRef.current?.querySelector('div[role="button"]');
    if (btn) {
      btn.click();
    } else {
      setError('Google sign-in failed to load. Please refresh the page and try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) { setError('Please enter your full name'); return false; }
    if (!formData.email.trim()) { setError('Please enter your email address'); return false; }

    const email = formData.email.trim().toLowerCase();
    if (!email.endsWith('@students.wits.ac.za') && !email.endsWith('@student.uj.ac.za')) {
      setError('Please use your university email (@students.wits.ac.za or @student.uj.ac.za)');
      return false;
    }
    const localPart = email.split('@')[0];
    if (!/^\d{6,10}$/.test(localPart)) {
      setError('Your email must start with your student number (e.g. 2307134@students.wits.ac.za)');
      return false;
    }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return false; }
    if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      setError('Password must contain at least one letter and one number');
      return false;
    }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const result = await register({
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        year_of_study: formData.year_of_study,
        faculty: formData.faculty,
      });

      if (result.success) {
        navigate('/verify-email', { state: { email: formData.email.trim().toLowerCase() } });
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
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <img src={logoImg} alt="oneApplyHub logo" className="h-20 w-20 object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Join Our Community</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Connect with fellow students and find your perfect accommodation</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Already have an account?</span>
            <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800 transition-colors flex items-center text-sm group">
              Sign in here
              <ArrowRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-8 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
          {/* Hidden container for Google's real rendered button — required for popup to work */}
          <div ref={googleButtonRef} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden' }} aria-hidden="true" />
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
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">or register with university email</span>
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
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  id="name" name="name" type="text" required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 transition-all"
                  placeholder="Enter your full name"
                  value={formData.name} onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">University Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  id="email" name="email" type="email" required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 transition-all"
                  placeholder="1234567@students.wits.ac.za"
                  value={formData.email} onChange={handleChange}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">student-number@students.wits.ac.za or student-number@student.uj.ac.za</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="year_of_study" className="block text-sm font-semibold text-gray-700 mb-2">Year of Study</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <GraduationCap className="h-4 w-4 text-emerald-500" />
                  </div>
                  <select
                    id="year_of_study" name="year_of_study"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white transition-all"
                    value={formData.year_of_study} onChange={handleChange}
                  >
                    <option value="">Select year</option>
                    {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="faculty" className="block text-sm font-semibold text-gray-700 mb-2">Faculty</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Building className="h-4 w-4 text-purple-500" />
                  </div>
                  <select
                    id="faculty" name="faculty"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white transition-all"
                    value={formData.faculty} onChange={handleChange}
                  >
                    <option value="">Select faculty</option>
                    {FACULTY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'} required
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 transition-all"
                  placeholder="Create a password (min 8 chars, 1 letter + 1 number)"
                  value={formData.password} onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-blue-500 transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 transition-all"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword} onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-blue-500 transition-colors">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-6 rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Creating your account...
                </div>
              ) : (
                <div className="flex items-center">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </div>
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800 dark:text-blue-300 space-y-0.5">
                  <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">University Email Required</p>
                  <p>✓ @students.wits.ac.za (Wits University)</p>
                  <p>✓ @student.uj.ac.za (University of Johannesburg)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
