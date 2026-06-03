import { useEffect, useRef, useState } from 'react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const GoogleSignInButton = ({ onSuccess, onError, loading, label = 'Continue with Google' }) => {
  const [ready, setReady] = useState(false);
  const clientRef = useRef(null);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => { onSuccessRef.current = onSuccess; });

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      onError?.('Google sign-in is not configured.');
      return;
    }

    const build = () => {
      // initTokenClient opens a real popup every time — no iframe state issues.
      clientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (resp) => {
          if (resp.error) { onError?.(resp.error); return; }
          onSuccessRef.current(resp.access_token);
        },
      });
      setReady(true);
    };

    if (window.google?.accounts?.oauth2) {
      build();
    } else {
      const t = setInterval(() => {
        if (window.google?.accounts?.oauth2) { clearInterval(t); build(); }
      }, 100);
      return () => clearInterval(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = () => {
    if (!clientRef.current) return;
    // prompt: 'select_account' forces the account picker every single time.
    clientRef.current.requestAccessToken({ prompt: 'select_account' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || !ready}
      className="w-full flex items-center justify-center gap-3 py-3 px-5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
      ) : (
        <GoogleIcon />
      )}
      {label}
    </button>
  );
};

export default GoogleSignInButton;
