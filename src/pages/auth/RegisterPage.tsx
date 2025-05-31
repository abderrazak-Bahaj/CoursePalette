import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ReCaptcha from '@/components/ui/ReCaptcha';

// Replace with your actual site key
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LcxoyYrAAAAAIDW5NTKsq0YYkw0P6lypOy3edTq';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaError, setRecaptchaError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  // Cleanup effect to reset reCAPTCHA state when component unmounts
  useEffect(() => {
    return () => {
      // Reset reCAPTCHA token and error state when leaving the page
      setRecaptchaToken('');
      setRecaptchaError('');
    };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // With reCAPTCHA v3, token should already be set by the component
      // If not, we can execute again just to be sure
      if (!recaptchaToken && window.grecaptcha) {
        try {
          const newToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'register' });
          setRecaptchaToken(newToken);
        } catch (error) {
          console.error('Failed to get reCAPTCHA token:', error);
          setRecaptchaError('Failed to verify reCAPTCHA. Please try again or refresh the page.');
          setIsLoading(false);
          return;
        }
      }

      // Register the user with reCAPTCHA token
      await register(name, email, password, recaptchaToken);
      setIsRegistered(true);
      
      // Redirect to verification page
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      }, 3000);
    } catch (error: any) {
      // Check if it's a reCAPTCHA validation error
      if (error?.message?.includes('reCAPTCHA verification failed')) {
        setRecaptchaError('reCAPTCHA verification failed. Please try again.');
        // Reset reCAPTCHA
        setRecaptchaToken('');
        if (window.grecaptcha) {
          try {
            const newToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'register' });
            setRecaptchaToken(newToken);
          } catch (err) {
            console.error('Failed to reset reCAPTCHA:', err);
          }
        }
      }
      
      toast({
        title: 'Registration Failed',
        description: error?.message || 'An error occurred during registration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaChange = (token: string) => {
    setRecaptchaToken(token);
    setRecaptchaError('');
  };

  const handleCaptchaExpired = () => {
    setRecaptchaToken('');
    setRecaptchaError('reCAPTCHA has expired. Please verify again.');
  };

  const handleCaptchaError = () => {
    setRecaptchaToken('');
    setRecaptchaError('Error loading reCAPTCHA. Please refresh the page.');
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <h1 className="text-3xl font-bold text-course-blue">
                CoursePalette
              </h1>
            </Link>
            <h2 className="text-2xl font-bold">Join CoursePalette</h2>
            <p className="text-gray-600">Create an account to start learning</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
              {isRegistered ? (
                <div className="text-center py-6">
                  <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
                    <p className="font-medium">Registration Successful!</p>
                    <p>Check your email to verify your account.</p>
                  </div>
                  <p className="mb-4">
                    We've sent a verification link to <strong>{email}</strong>.
                    Please check your inbox and click the link to complete your registration.
                  </p>
                  <Button asChild variant="outline">
                    <Link to={`/verify-email?email=${encodeURIComponent(email)}`}>
                      Go to Verification Page
                    </Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <ReCaptcha
                      siteKey={RECAPTCHA_SITE_KEY}
                      onChange={handleCaptchaChange}
                      onExpired={handleCaptchaExpired}
                      onError={handleCaptchaError}
                      version="v3"
                      action="register"
                    />
                    {recaptchaError && (
                      <p className="text-xs text-red-500 mt-1">{recaptchaError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      This site is protected by reCAPTCHA v3. By registering, you agree to Google's 
                      <a 
                        href="https://policies.google.com/privacy" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-course-blue hover:underline ml-1 mr-1"
                      >
                        Privacy Policy
                      </a>
                      and
                      <a 
                        href="https://policies.google.com/terms" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-course-blue hover:underline ml-1"
                      >
                        Terms of Service
                      </a>.
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <Checkbox id="terms" className="mt-1" />
                    <Label htmlFor="terms" className="ml-2 text-sm">
                      I agree to the{' '}
                      <Link
                        to="/terms"
                        className="text-course-blue hover:underline"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        to="/privacy"
                        className="text-course-blue hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-course-blue"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              )}

              {/*  
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or sign up with
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="outline">Google</Button>
                  <Button variant="outline">Facebook</Button>
                </div>
              </div> 
              */}

              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-course-blue hover:underline">
                  Log in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
