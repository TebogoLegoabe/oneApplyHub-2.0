import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, KeyRound } from 'lucide-react';
import { authAPI } from '../services/api';
import AuthShell from '../components/AuthShell';
import { Alert, Button, Input } from '../components/ui';

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

  if (success) {
    return (
      <AuthShell icon={CheckCircle2} title="Check your email" description="We sent password reset instructions." backTo="/login" backLabel="Back to login">
        <div className="text-center">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            A reset link is on its way to <span className="font-semibold text-slate-900 dark:text-white">{email}</span>. The link expires in 1 hour.
          </p>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Did not get it? Check your spam folder or try again in a few minutes.</p>
          <Button to="/login" size="lg" fullWidth className="mt-6">Back to login</Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      icon={KeyRound}
      title="Reset your password"
      description="Enter the email you registered with and we will send reset instructions."
      backTo="/login"
      backLabel="Back to login"
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300">Sign in</Link>
        </>
      }
    >
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          icon={Mail}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>Send reset link</Button>
      </form>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
