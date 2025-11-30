import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();
  const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

  useEffect(() => {
    // Only load if tracking ID is provided
    if (!GA_TRACKING_ID) {
      console.warn('Google Analytics Tracking ID not found in environment variables');
      return;
    }

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID);

    return () => {
      // Cleanup
      if (script1.parentNode) {
        script1.parentNode.removeChild(script1);
      }
    };
  }, [GA_TRACKING_ID]);

  // Track page views on route change
  useEffect(() => {
    if (window.gtag && GA_TRACKING_ID) {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location, GA_TRACKING_ID]);

  return null;
};

export default GoogleAnalytics;
