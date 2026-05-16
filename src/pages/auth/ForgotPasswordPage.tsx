import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ds/primitives/Button';
import { Input } from '@/components/ds/primitives/Input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ds/primitives/Card';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset request failed:', error);
      toast({
        title: 'Request Failed',
        description: 'Unable to send password reset link. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <h1 className="text-3xl font-bold text-violet-400">
                CoursePalette
              </h1>
            </Link>
            <h2 className="text-2xl font-bold">Reset Your Password</h2>
            <p className="text-neutral-400">
              Enter your email and we'll send you instructions to reset your
              password
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isSubmitted ? (
                <div className="text-center py-6">
                  <div className="bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg p-3 mb-4">
                    Reset link sent! Check your email.
                  </div>
                  <p className="mb-4">
                    We've sent reset instructions to <strong>{email}</strong>
                  </p>
                  <Button asChild variant="secondary">
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
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="action"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center text-sm">
                <Link
                  to="/login"
                  className="text-violet-400 hover:text-violet-300"
                >
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

export default ForgotPasswordPage;
