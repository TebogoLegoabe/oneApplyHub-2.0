import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldOff, Lock, Copy, CheckCircle2, Eye, EyeOff, Smartphone, QrCode, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mfaAPI } from '../services/api';
import { Alert, Button, Card, Checkbox, Input, PageHeader, useToast } from '../components/ui';

const STEPS = { IDLE: 'idle', QR: 'qr', BACKUP: 'backup', DISABLE: 'disable' };

const formatBackupCode = (code) => `${code.slice(0, 4)}-${code.slice(4)}`;

const MFASetupPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(STEPS.IDLE);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [savedConfirmed, setSavedConfirmed] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mfaEnabled = user?.mfa_enabled;

  useEffect(() => {
    if (!successMsg) return undefined;
    const timer = setTimeout(() => setSuccessMsg(''), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleStartSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await mfaAPI.setup();
      setQrCode(response.data.qr_code);
      setSecret(response.data.secret);
      setStep(STEPS.QR);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start two-factor setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await mfaAPI.enable(code);
      setBackupCodes(response.data.backup_codes);
      await refreshUser();
      setStep(STEPS.BACKUP);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
      return true;
    } catch {
      toast.error('Could not copy to clipboard.');
      return false;
    }
  };

  const handleCopyAll = async () => {
    const copied = await copyToClipboard(backupCodes.map(formatBackupCode).join('\n'), 'Backup codes copied.');
    if (copied) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleDisable = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await mfaAPI.disable(disablePassword, disableCode);
      await refreshUser();
      setStep(STEPS.IDLE);
      setDisablePassword('');
      setDisableCode('');
      setSuccessMsg('Two-factor authentication has been disabled.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disable two-factor authentication.');
    } finally {
      setLoading(false);
    }
  };

  const resetToIdle = () => {
    setStep(STEPS.IDLE);
    setCode('');
    setError('');
    setDisablePassword('');
    setDisableCode('');
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <PageHeader
        backTo="/dashboard"
        backLabel="Back to dashboard"
        eyebrow="Account security"
        icon={ShieldCheck}
        title="Two-factor authentication"
        description="Protect your account with a one-time code from an authenticator app."
        action={mfaEnabled ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />Enabled</span> : <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/5"><ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />Off</span>}
        className="mb-4"
      />

      <Card>
        {successMsg && <Alert tone="success" className="mb-5" onDismiss={() => setSuccessMsg('')}>{successMsg}</Alert>}
        {error && <Alert tone="error" className="mb-5">{error}</Alert>}

        {step === STEPS.IDLE && (mfaEnabled ? (
          <div className="space-y-5">
            <Alert tone="success" title="Two-factor authentication is active">Your account is protected by an authenticator app.</Alert>
            <div className="rounded-2xl border border-red-200 p-5 dark:border-red-900/60">
              <div className="mb-2 flex items-center gap-2">
                <ShieldOff className="h-4 w-4 text-red-500" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">Disable two-factor authentication</h2>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Disabling this makes your account less secure. You will need to confirm with your password and current authenticator code.
              </p>
              <Button variant="danger-soft" onClick={() => { setStep(STEPS.DISABLE); setError(''); }}>Disable two-factor auth</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/60 dark:bg-brand-500/10">
              <h2 className="mb-3 text-sm font-semibold text-brand-900 dark:text-brand-200">How it works</h2>
              <ol className="space-y-2.5 text-sm text-brand-800 dark:text-brand-100">
                {[
                  [Smartphone, <>Install <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>Microsoft Authenticator</strong> on your phone.</>],
                  [QrCode, 'Scan the QR code we generate for you.'],
                  [KeyRound, 'Enter the 6-digit code to confirm setup.'],
                  [Lock, 'Save your backup codes somewhere safe.'],
                ].map(([Icon, text], index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>
            <Button onClick={handleStartSetup} loading={loading} size="lg" fullWidth>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />Set up two-factor authentication
            </Button>
          </div>
        ))}

        {step === STEPS.QR && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">Scan this QR code</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Open your authenticator app and scan the code below.</p>
            </div>
            <div className="flex justify-center">
              <div className="inline-block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <img src={`data:image/png;base64,${qrCode}`} alt="Two-factor authentication QR code" className="h-48 w-48" />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Can't scan? Enter this key manually:</p>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
                <code className="flex-1 break-all font-mono text-sm text-slate-800 dark:text-slate-200">{secret}</code>
                <button type="button" onClick={() => copyToClipboard(secret, 'Secret key copied.')} className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-brand-700 dark:hover:bg-slate-800 dark:hover:text-brand-300" aria-label="Copy secret key">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <form onSubmit={handleEnable} className="space-y-4">
              <Input
                label="Enter the 6-digit code to confirm"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
                className="text-center font-mono text-2xl tracking-[0.4em]"
                placeholder="000000"
                value={code}
                onChange={(event) => { setCode(event.target.value.replace(/\D/g, '')); if (error) setError(''); }}
              />
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button type="button" variant="secondary" className="flex-1" onClick={resetToIdle}>Cancel</Button>
                <Button type="submit" className="flex-1" loading={loading} disabled={code.length < 6}>Enable two-factor auth</Button>
              </div>
            </form>
          </div>
        )}

        {step === STEPS.BACKUP && (
          <div className="space-y-6">
            <Alert tone="warning" title="Save your backup codes now">
              These codes let you sign in if you lose your phone. Each code works once. Store them somewhere safe — you will not see them again.
            </Alert>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Backup codes</span>
                <Button variant="ghost" size="xs" onClick={handleCopyAll}>
                  {copiedAll ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                  {copiedAll ? 'Copied' : 'Copy all'}
                </Button>
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {backupCodes.map((backupCode) => (
                  <li key={backupCode}>
                    <code className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center font-mono text-sm tracking-widest text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                      {formatBackupCode(backupCode)}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
            <Checkbox checked={savedConfirmed} onChange={(event) => setSavedConfirmed(event.target.checked)} label="I have saved my backup codes in a safe place" />
            <Button onClick={() => navigate('/dashboard')} disabled={!savedConfirmed} size="lg" fullWidth>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />Done — go to dashboard
            </Button>
          </div>
        )}

        {step === STEPS.DISABLE && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">Disable two-factor authentication</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Confirm your identity to remove two-factor authentication from your account.</p>
            </div>
            <form onSubmit={handleDisable} className="space-y-4">
              {!user?.oauth_provider && (
                <Input
                  label="Current password"
                  icon={Lock}
                  type={showDisablePassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={disablePassword}
                  onChange={(event) => { setDisablePassword(event.target.value); if (error) setError(''); }}
                  trailing={
                    <button type="button" onClick={() => setShowDisablePassword((previous) => !previous)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200" aria-label={showDisablePassword ? 'Hide password' : 'Show password'}>
                      {showDisablePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              )}
              <Input
                label="Authenticator code"
                optional
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="text-center font-mono text-xl tracking-[0.4em]"
                placeholder="000000"
                value={disableCode}
                onChange={(event) => { setDisableCode(event.target.value.replace(/\D/g, '')); if (error) setError(''); }}
              />
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button type="button" variant="secondary" className="flex-1" onClick={resetToIdle}>Cancel</Button>
                <Button type="submit" variant="danger" className="flex-1" loading={loading} disabled={!user?.oauth_provider && !disablePassword}>Disable two-factor auth</Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MFASetupPage;
