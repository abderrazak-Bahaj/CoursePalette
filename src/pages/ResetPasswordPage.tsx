import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    token?: string;
    email?: string;
    password?: string;
    passwordConfirmation?: string;
  }>({});
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetPassword } = useAuth();

  // Parse token and email from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');
    
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
  }, [location]);

  const validateForm = () => {
    const newErrors: {
      token?: string;
      email?: string;
      password?: string;
      passwordConfirmation?: string;
    } = {};

    if (!token) newErrors.token = 'Token is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 8) 
      newErrors.password = 'Password must be at least 8 characters';
    if (password !== passwordConfirmation) 
      newErrors.passwordConfirmation = 'Passwords must match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await resetPassword(token, email, password, passwordConfirmation);
      setIsSubmitted(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset failed:', error);
      // Error messages are handled in the resetPassword function
    } finally {
      setIsLoading(false);
    }
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
            <h2 className="text-2xl font-bold">Reset Your Password</h2>
            <p className="text-gray-600">
              Enter your new password below
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isSubmitted ? (
                <div className="text-center py-6">
                  <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
                    Password reset successful!
                  </div>
                  <p className="mb-4">
                    Your password has been reset. You'll be redirected to login.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/login">Back to Login</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!!email}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
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
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="passwordConfirmation">Confirm Password</Label>
                    <Input
                      id="passwordConfirmation"
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                    />
                    {errors.passwordConfirmation && (
                      <p className="text-red-500 text-xs mt-1">{errors.passwordConfirmation}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-course-blue"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center text-sm">
                <Link to="/login" className="text-course-blue hover:underline">
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPasswordPage; 