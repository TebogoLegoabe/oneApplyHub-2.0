import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, User, GraduationCap, Building,
  Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, UserPlus,
} from 'lucide-react';
import logoImg from '../assets/OneApply-Hub-Logo.png';
import AuthBackground from '../components/AuthBackground';
import GoogleSignInButton from '../components/GoogleSignInButton';

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Honours', 'Masters', 'PhD', 'Other'];
const FACULTY_OPTIONS = [
  'Engineering', 'Commerce', 'Law', 'Health Sciences',
  'Humanities', 'Science', 'Education', 'Management', 'Art & Design', 'Other',
];

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

  const handleGoogleSuccess = async (credential) => {
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
      <AuthBackground />

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
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={setError}
            loading={googleLoading}
          />

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
