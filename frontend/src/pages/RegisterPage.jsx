import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, Building, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import { Alert, Button, Input, Select } from '../components/ui';

const YEAR_OPTIONS = ['Grade 11', 'Grade 12 / Matric', 'Gap year', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Honours', 'Masters', 'PhD', 'Other'];
const FACULTY_OPTIONS = ['Matric learner', 'Not sure yet', 'Engineering', 'Commerce', 'Law', 'Health Sciences', 'Humanities', 'Science', 'Education', 'Management', 'Art & Design', 'Other'];

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

const validate = (formData) => {
  if (!formData.name.trim()) return 'Please enter your full name';
  if (!formData.email.trim()) return 'Please enter your email address';
  if (!formData.year_of_study) return 'Please select your study level';
  if (!formData.faculty) return 'Please select your faculty or field';
  if (formData.password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) return 'Password must contain at least one letter and one number';
  if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
  return '';
};

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const email = formData.email.trim().toLowerCase();
      const result = await register({ name: formData.name.trim(), email, password: formData.password, year_of_study: formData.year_of_study, faculty: formData.faculty });
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
    <AuthShell
      icon={UserPlus}
      title="Create your account"
      description="Matric learners and students can register with any valid email address."
      width="lg"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300">
            Sign in
          </Link>
        </>
      }
    >
      <Alert tone="info" className="mb-5">
        <strong className="font-semibold">Prefer Google sign-in?</strong> Create your account with your study details first; after that you can sign in with Google.
      </Alert>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input label="Full name" icon={User} name="name" type="text" autoComplete="name" placeholder="e.g. Thandi Nkosi" value={formData.name} onChange={handleChange} required />
        <Input label="Email address" icon={Mail} name="email" type="email" autoComplete="email" placeholder="Gmail, iCloud, or school email" value={formData.email} onChange={handleChange} required />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Study level" icon={GraduationCap} name="year_of_study" value={formData.year_of_study} onChange={handleChange} required>
            <option value="">Select…</option>
            {YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year}</option>)}
          </Select>
          <Select label="Faculty or field" icon={Building} name="faculty" value={formData.faculty} onChange={handleChange} required>
            <option value="">Select…</option>
            {FACULTY_OPTIONS.map((faculty) => <option key={faculty} value={faculty}>{faculty}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            icon={Lock}
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            required
            trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((previous) => !previous)} />}
          />
          <Input
            label="Confirm password"
            icon={Lock}
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            trailing={<PasswordToggle shown={showConfirmPassword} onToggle={() => setShowConfirmPassword((previous) => !previous)} />}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Use at least 8 characters with a mix of letters and numbers.</p>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Create account
          {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>

        <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="font-semibold text-slate-700 underline-offset-2 hover:underline dark:text-slate-200">Terms</Link> and{' '}
          <Link to="/privacy" className="font-semibold text-slate-700 underline-offset-2 hover:underline dark:text-slate-200">Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
