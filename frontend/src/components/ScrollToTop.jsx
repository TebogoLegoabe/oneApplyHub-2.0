import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** React Router keeps scroll position between routes; reset it on path change like a normal site. */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default ScrollToTop;
