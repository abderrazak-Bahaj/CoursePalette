import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ds/primitives/Button';
import { Input } from '@/components/ds/primitives/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ds/primitives/Card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description:
          error.message || 'Please check your credentials and try again',
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
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-neutral-400">
              Log in to your account to continue learning
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Log In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="ml-2 text-sm">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-violet-400 hover:text-violet-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  variant="action"
                  size="md"
                  className="w-full"
                  loading={isLoading}
                >
                  Log In
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#0f172a] text-neutral-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="secondary">Google</Button>
                <Button variant="secondary">Facebook</Button>
              </div> */}
              </div>

              <div className="mt-6 text-center text-sm text-neutral-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-violet-400 hover:text-violet-300"
                >
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
