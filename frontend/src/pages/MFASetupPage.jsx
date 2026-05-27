import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mfaAPI } from '../services/api';
import {
  ShieldCheck, ShieldOff, Lock, Copy, CheckCircle, AlertCircle,
  ArrowLeft, Eye, EyeOff,
} from 'lucide-react';

const STEPS = { IDLE: 'idle', QR: 'qr', BACKUP: 'backup', DISABLE: 'disable' };

const MFASetupPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

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
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const handleStartSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await mfaAPI.setup();
      setQrCode(res.data.qr_code);
      setSecret(res.data.secret);
      setStep(STEPS.QR);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to start MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await mfaAPI.enable(code);
      setBackupCodes(res.data.backup_codes);
      await refreshUser();
      setStep(STEPS.BACKUP);
    } catch (e) {
      setError(e.response?.data?.error || 'Invalid code, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    const formatted = backupCodes.map(c => `${c.slice(0, 4)}-${c.slice(4)}`).join('\n');
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await mfaAPI.disable(disablePassword, disableCode);
      await refreshUser();
      setStep(STEPS.IDLE);
      setDisablePassword('');
      setDisableCode('');
      setSuccessMsg('MFA has been disabled.');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Two-Factor Authentication</h1>
                <p className="text-blue-100 text-sm">Protect your account with an authenticator app</p>
              </div>
            </div>
          </div>

          <div className="p-6">

            {successMsg && (
              <div className="mb-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">{successMsg}</p>
              </div>
            )}

            {error && (
              <div className="mb-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* ── STEP: IDLE ── */}
            {step === STEPS.IDLE && (
              <div>
                {mfaEnabled ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4">
                      <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">MFA is active</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Your account is protected by an authenticator app.</p>
                      </div>
                    </div>
                    <div className="border border-red-200 dark:border-red-800 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldOff className="w-4 h-4 text-red-500" />
                        <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Disable MFA</h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Disabling MFA makes your account less secure. You will need to confirm with your password and current authenticator code.
                      </p>
                      <button
                        onClick={() => { setStep(STEPS.DISABLE); setError(''); }}
                        className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        Disable Two-Factor Auth
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">How it works</h3>
                      <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-400">
                        <li>1. Install <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>Microsoft Authenticator</strong> on your phone</li>
                        <li>2. Scan the QR code we generate</li>
                        <li>3. Enter the 6-digit code to confirm setup</li>
                        <li>4. Save your backup codes in a safe place</li>
                      </ul>
                    </div>
                    <button
                      onClick={handleStartSetup}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Set Up Two-Factor Auth
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP: QR ── */}
            {step === STEPS.QR && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Scan this QR code</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open your authenticator app and scan the code below.</p>
                </div>
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm inline-block">
                    <img src={`data:image/png;base64,${qrCode}`} alt="MFA QR Code" className="w-48 h-48" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Can't scan? Enter this code manually:</p>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
                    <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 break-all">{secret}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(secret)}
                      className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                      title="Copy secret"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <form onSubmit={handleEnable} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Enter the 6-digit code to confirm
                    </label>
                    <input
                      type="text" inputMode="numeric" autoComplete="one-time-code"
                      maxLength={6} required autoFocus
                      className="w-full text-center text-2xl tracking-widest font-mono py-3 px-4 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); if (error) setError(''); }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setStep(STEPS.IDLE); setCode(''); setError(''); }}
                      className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || code.length < 6}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Verifying...
                        </div>
                      ) : 'Enable MFA'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── STEP: BACKUP CODES ── */}
            {step === STEPS.BACKUP && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Save your backup codes now</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      These codes let you sign in if you lose your phone. Each code can only be used once.
                      Store them somewhere safe. You won't see them again.
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Backup Codes</span>
                    <button onClick={handleCopyAll} className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      {copiedAll ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAll ? 'Copied!' : 'Copy all'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((c) => (
                      <code key={c} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-mono text-center text-gray-800 dark:text-gray-200 tracking-widest">
                        {c.slice(0, 4)}-{c.slice(4)}
                      </code>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox" id="savedConfirm"
                    checked={savedConfirmed}
                    onChange={(e) => setSavedConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="savedConfirm" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    I have saved my backup codes in a safe place
                  </label>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  disabled={!savedConfirmed}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  MFA Enabled. Go to Dashboard
                </button>
              </div>
            )}

            {/* ── STEP: DISABLE ── */}
            {step === STEPS.DISABLE && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Disable Two-Factor Auth</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Confirm your identity to remove MFA from your account.</p>
                </div>
                <form onSubmit={handleDisable} className="space-y-4">
                  {!user?.oauth_provider && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type={showDisablePassword ? 'text' : 'password'}
                          required
                          className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                          placeholder="Enter your password"
                          value={disablePassword}
                          onChange={(e) => { setDisablePassword(e.target.value); if (error) setError(''); }}
                        />
                        <button type="button" onClick={() => setShowDisablePassword(!showDisablePassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors">
                          {showDisablePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Authenticator Code <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text" inputMode="numeric" maxLength={6}
                      className="w-full text-center text-xl tracking-widest font-mono py-3 px-4 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="000000"
                      value={disableCode}
                      onChange={(e) => { setDisableCode(e.target.value.replace(/\D/g, '')); if (error) setError(''); }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setStep(STEPS.IDLE); setError(''); setDisablePassword(''); setDisableCode(''); }}
                      className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || (!user?.oauth_provider && !disablePassword)}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Disabling...
                        </div>
                      ) : 'Disable MFA'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFASetupPage;
