// src/hooks/useIsMobile.jsx

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Matches your CSS media query

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
}

export default useIsMobile;