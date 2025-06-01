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
  action = 'register',
}: ReCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMountedRef = useRef(true);

  console.log('ReCaptcha siteKey:', siteKey, 'version:', version);

  // Load the reCAPTCHA script with the appropriate API version
  useEffect(() => {
    isMountedRef.current = true;

    // Add reCAPTCHA script if it hasn't been added yet
    if (!document.querySelector('script[src*="recaptcha"]')) {
      const script = document.createElement('script');

      if (version === 'v3') {
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      } else {
        script.src = `https://www.google.com/recaptcha/api.js?render=explicit&onload=onReCaptchaLoad`;
        // Create a callback function that reCAPTCHA will call when loaded for v2
        window.onReCaptchaLoad = () => {
          if (isMountedRef.current) {
            setIsLoaded(true);
            if (version === 'v2') {
              renderReCaptchaV2();
            }
          }
        };
      }

      script.async = true;
      script.defer = true;

      // For v3, we'll use the onload event of the script
      if (version === 'v3') {
        script.onload = () => {
          if (isMountedRef.current) {
            setIsLoaded(true);
            executeReCaptchaV3();
          }
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
      // Mark component as unmounted
      isMountedRef.current = false;

      // Clear any intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Cleanup v2 widget
      if (
        widgetIdRef.current !== null &&
        window.grecaptcha &&
        version === 'v2'
      ) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
          // Also try to remove the widget entirely
          if (window.grecaptcha.getResponse) {
            window.grecaptcha.getResponse(widgetIdRef.current);
          }
        } catch (error) {
          console.log('Error cleaning up reCAPTCHA widget:', error);
        }
        widgetIdRef.current = null;
      }

      // Clean up global callback
      if (window.onReCaptchaLoad) {
        delete window.onReCaptchaLoad;
      }

      // Reset container content
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [siteKey, version, action]); // Re-render if site key, version or action changes

  // For v3, periodically refresh the token
  useEffect(() => {
    if (version !== 'v3' || !isLoaded || !isMountedRef.current) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Refresh token every 90 seconds
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        executeReCaptchaV3();
      }
    }, 90000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoaded, version, action]);

  // For v3, execute reCAPTCHA and get token
  const executeReCaptchaV3 = async () => {
    if (
      !window.grecaptcha ||
      !window.grecaptcha.execute ||
      !isMountedRef.current
    )
      return;

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      if (isMountedRef.current) {
        onChange(token);
      }
    } catch (error) {
      console.error('Error executing reCAPTCHA v3:', error);
      if (onError && isMountedRef.current) {
        onError(error as Error);
      }
    }
  };

  // For v2, render the reCAPTCHA widget
  const renderReCaptchaV2 = () => {
    if (
      !containerRef.current ||
      !window.grecaptcha ||
      !window.grecaptcha.render ||
      !isMountedRef.current
    )
      return;

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
        callback: (token: string) => {
          if (isMountedRef.current) {
            onChange(token);
          }
        },
        'expired-callback': () => {
          if (onExpired && isMountedRef.current) {
            onExpired();
          }
        },
        'error-callback': (error: Error) => {
          if (onError && isMountedRef.current) {
            onError(error);
          }
        },
      });
    } catch (error) {
      console.error('Error rendering reCAPTCHA v2:', error);
      if (onError && isMountedRef.current) {
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
