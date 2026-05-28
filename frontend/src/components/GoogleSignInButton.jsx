import { useEffect, useLayoutEffect, useRef } from 'react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const GoogleSignInButton = ({ onSuccess, onError, loading, label = 'Continue with Google' }) => {
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const initializedRef = useRef(false);

  const onSuccessRef = useRef(onSuccess);
  useEffect(() => { onSuccessRef.current = onSuccess; });

  // Use useLayoutEffect so the container has its final dimensions before we call renderButton.
  useLayoutEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      onError?.('Google sign-in is not configured. Please use email and password.');
      return;
    }

    const init = () => {
      if (!overlayRef.current || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => onSuccessRef.current(credential),
      });
      window.google.accounts.id.renderButton(overlayRef.current, {
        theme: 'outline',
        size: 'large',
        width: containerRef.current.getBoundingClientRect().width || 400,
      });
      initializedRef.current = true;
    };

    if (window.google?.accounts) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts) {
          clearInterval(interval);
          init();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="relative w-full mb-6 group">
      {/* Visual layer — pointer-events: none so clicks pass through to the Google iframe */}
      <div
        className="w-full flex items-center justify-center gap-3 py-3 px-5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200 font-semibold group-hover:bg-gray-50 dark:group-hover:bg-gray-700 group-hover:border-gray-300 transition-all"
        style={{ pointerEvents: 'none', opacity: loading ? 0.5 : 1 }}
        aria-hidden="true"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
        ) : (
          <GoogleIcon />
        )}
        {label}
      </div>

      {/* Google's real rendered button — transparent overlay that receives actual clicks.
          No overflow: hidden here — clipping the iframe can swallow pointer events. */}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          opacity: 0,
          pointerEvents: loading ? 'none' : 'auto',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
        aria-label={label}
      />
    </div>
  );
};

export default GoogleSignInButton;
