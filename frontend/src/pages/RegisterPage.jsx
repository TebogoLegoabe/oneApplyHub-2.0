import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, GraduationCap, Building, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft, UserPlus } from 'lucide-react';
import AuthBackground from '../components/AuthBackground';

const YEAR_OPTIONS = ['Grade 11', 'Grade 12 / Matric', 'Gap year', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Honours', 'Masters', 'PhD', 'Other'];
const FACULTY_OPTIONS = ['Matric learner', 'Not sure yet', 'Engineering', 'Commerce', 'Law', 'Health Sciences', 'Humanities', 'Science', 'Education', 'Management', 'Art & Design', 'Other'];
const PAGE = 'min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden';
const CARD = 'bg-white dark:bg-slate-900/95 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden';
const INPUT = 'w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', year_of_study: '', faculty: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, sendVerificationCode } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return setError('Please enter your full name'), false;
    if (!formData.email.trim()) return setError('Please enter your email address'), false;
    if (!formData.year_of_study) return setError('Please select your study level'), false;
    if (!formData.faculty) return setError('Please select your faculty or field'), false;
    if (formData.password.length < 8) return setError('Password must be at least 8 characters'), false;
    if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) return setError('Password must contain at least one letter and one number'), false;
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match'), false;
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const email = formData.email.trim().toLowerCase();
      const result = await register({ name: formData.name, email, password: formData.password, year_of_study: formData.year_of_study, faculty: formData.faculty });
      if (result.success) {
        navigate('/verify-email', { replace: true, state: { email: result.email || email } });
      } else if ((result.error || '').toLowerCase().includes('already registered')) {
        const resend = await sendVerificationCode(email);
        if (resend.success) {
          navigate('/verify-email', { replace: true, state: { email } });
        } else {
          setError(resend.error || 'Account exists, but we could not send a new verification code.');
        }
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={PAGE}>
      <AuthBackground />
      <div className="relative z-10 mx-auto w-full max-w-lg">
        <Link to="/" className="mb-4 inline-flex items-center text-xs font-bold text-slate-500 hover:text-brand-600 dark:text-slate-400">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to home
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-sm dark:bg-brand-500/10 dark:text-brand-300">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Matric learners and students can register with any valid email.</p>
        </div>

        <div className={CARD}>
          <div className="h-1 bg-brand-600" />
          <div className="p-5 sm:p-6">
            <div className="mb-5 rounded-2xl bg-brand-50 p-4 text-xs leading-5 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <strong>Google sign-in:</strong> first create your account with your study details. After that, you can sign in with Google.
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" /><input className={INPUT} name="name" type="text" placeholder="Full name" value={formData.name} onChange={handleChange} required /></div>
              <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" /><input className={INPUT} name="email" type="email" placeholder="Email address, e.g. Gmail, iCloud, or school email" value={formData.email} onChange={handleChange} required /></div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative"><GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" /><select className={INPUT} name="year_of_study" value={formData.year_of_study} onChange={handleChange} required><option value="">Study level</option>{YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year}</option>)}</select></div>
                <div className="relative"><Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-500" /><select className={INPUT} name="faculty" value={formData.faculty} onChange={handleChange} required><option value="">Faculty / field</option>{FACULTY_OPTIONS.map((faculty) => <option key={faculty} value={faculty}>{faculty}</option>)}</select></div>
              </div>

              <div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" /><input className={INPUT} name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={formData.password} onChange={handleChange} required /><button type="button" onClick={() => setShowPassword((previous) => !previous)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
              <div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" /><input className={INPUT} name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required /><button type="button" onClick={() => setShowConfirmPassword((previous) => !previous)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>

              <button disabled={loading} className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create account and verify email'}
              </button>
            </form>

            <Link to="/login" className="mt-4 flex items-center justify-center text-sm font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400">
              Already have an account? Sign in <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
