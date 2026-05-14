import { useEffect, useRef } from 'react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

// Wraps Google Identity Services: renders the real GIS button in a hidden
// container so the popup works, and exposes a styled visible button.
const GoogleSignInButton = ({ onSuccess, onError, loading, label = 'Continue with Google' }) => {
  const hiddenRef = useRef(null);

  const handleCallback = async ({ credential }) => {
    await onSuccess(credential);
  };

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const init = () => {
      if (!hiddenRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCallback,
      });
      window.google.accounts.id.renderButton(hiddenRef.current, {
        theme: 'outline',
        size: 'large',
        width: hiddenRef.current.offsetWidth || 400,
      });
    };

    if (window.google) {
      init();
    } else {
      // async defer script may not have loaded yet — poll until ready
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          init();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) {
      onError?.('Google sign-in is not configured. Please use email and password.');
      return;
    }
    const btn = hiddenRef.current?.querySelector('div[role="button"]');
    if (btn) {
      btn.click();
    } else {
      onError?.('Google sign-in failed to load. Please refresh the page and try again.');
    }
  };

  return (
    <>
      {/* Hidden container for Google's real rendered button — required for popup to work */}
      <div ref={hiddenRef} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden' }} aria-hidden="true" />
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
        ) : (
          <GoogleIcon />
        )}
        {label}
      </button>
    </>
  );
};

export default GoogleSignInButton;
