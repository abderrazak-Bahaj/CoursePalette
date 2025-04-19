import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
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

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      toast({
        title: 'Reset Link Sent',
        description: 'Check your email for instructions to reset your password',
      });
    }, 1500);
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
              Enter your email and we'll send you instructions to reset your
              password
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isSubmitted ? (
                <div className="text-center py-6">
                  <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
                    Reset link sent! Check your email.
                  </div>
                  <p className="mb-4">
                    We've sent reset instructions to <strong>{email}</strong>
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
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-course-blue"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;
