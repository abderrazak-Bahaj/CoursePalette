import { useEffect, useRef, useState } from 'react';

interface ReCaptchaProps {
  siteKey: string;
  onChange: (token: string) => void;
  onExpired?: () => void;
  onError?: (error: Error) => void;
  version?: 'v2' | 'v3';
  action?: string; // for v3 only
}

declare global {
  interface Window {
    grecaptcha: any;
    onReCaptchaLoad: () => void;
  }
}

const ReCaptcha = ({
  siteKey,
  onChange,
  onExpired,
  onError,
  version = 'v2',
  action = 'register'
}: ReCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  console.log('ReCaptcha siteKey:', siteKey, 'version:', version);

  // Load the reCAPTCHA script with the appropriate API version
  useEffect(() => {
    // Add reCAPTCHA script if it hasn't been added yet
    if (!document.querySelector('script[src*="recaptcha"]')) {
      const script = document.createElement('script');
      
      if (version === 'v3') {
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      } else {
        script.src = `https://www.google.com/recaptcha/api.js?render=explicit&onload=onReCaptchaLoad`;
        // Create a callback function that reCAPTCHA will call when loaded for v2
        window.onReCaptchaLoad = () => {
          setIsLoaded(true);
          if (version === 'v2') {
            renderReCaptchaV2();
          }
        };
      }
      
      script.async = true;
      script.defer = true;
      
      // For v3, we'll use the onload event of the script
      if (version === 'v3') {
        script.onload = () => {
          setIsLoaded(true);
          executeReCaptchaV3();
        };
      }
      
      document.head.appendChild(script);
    } else if (window.grecaptcha) {
      // If script is already loaded
      setIsLoaded(true);
      if (version === 'v3' && window.grecaptcha.execute) {
        executeReCaptchaV3();
      } else if (version === 'v2' && window.grecaptcha.render) {
        renderReCaptchaV2();
      }
    }

    return () => {
      // Cleanup: Reset reCAPTCHA if it was rendered
      if (widgetIdRef.current !== null && window.grecaptcha && version === 'v2') {
        window.grecaptcha.reset(widgetIdRef.current);
      }
    };
  }, [siteKey, version, action]); // Re-render if site key, version or action changes

  // For v3, periodically refresh the token
  useEffect(() => {
    if (version !== 'v3' || !isLoaded) return;

    // Refresh token every 90 seconds
    const intervalId = setInterval(() => {
      executeReCaptchaV3();
    }, 90000);

    return () => clearInterval(intervalId);
  }, [isLoaded, version, action]);

  // For v3, execute reCAPTCHA and get token
  const executeReCaptchaV3 = async () => {
    if (!window.grecaptcha || !window.grecaptcha.execute) return;

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      onChange(token);
    } catch (error) {
      console.error('Error executing reCAPTCHA v3:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  // For v2, render the reCAPTCHA widget
  const renderReCaptchaV2 = () => {
    if (!containerRef.current || !window.grecaptcha || !window.grecaptcha.render) return;
    
    // Reset if already rendered
    if (widgetIdRef.current !== null) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
      } catch (error) {
        console.error('Error resetting reCAPTCHA:', error);
      }
    }
    
    try {
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: onChange,
        'expired-callback': onExpired,
        'error-callback': onError
      });
    } catch (error) {
      console.error('Error rendering reCAPTCHA v2:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  // Only v2 needs a container to render into
  return version === 'v2' ? (
    <div ref={containerRef} className="g-recaptcha" />
  ) : (
    // For v3, we just need an invisible div
    <div className="g-recaptcha-v3" style={{ display: 'none' }} />
  );
};

export default ReCaptcha; 