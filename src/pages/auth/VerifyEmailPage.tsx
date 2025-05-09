import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/loader';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/api/authService';

const VerifyEmailPage = () => {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resendVerificationEmail } = useAuth();
  
  // Create a mutation for email verification
  const verifyEmailMutation = useMutation({
    mutationFn: async (params: { id: string, hash: string } | { url: string }) => {
      try {
        if ('url' in params) {
          // Direct verification URL
          return await authService.verifyEmailWithUrl(params.url);
        } else {
          // ID and hash parameters
          return await authService.verifyEmail(params.id, params.hash);
        }
      } catch (err: any) {
        console.error('Verification request failed:', err);
        // Extract detailed error message if available
        if (err.response?.data?.message) {
          throw new Error(`${err.response.data.message} ${JSON.stringify(err.response.data.debug_info || {})}`);
        }
        throw err;
      }
    },
    onSuccess: () => {
      setVerified(true);
      toast({
        title: 'Email verified',
        description: 'Your email has been verified successfully. You can now log in.',
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    },
    onError: (error: any) => {
      console.error('Email verification failed:', error);
      setError(error.message || 'Verification failed. Please try again or contact support.');
      
      // Don't automatically retry verification when it fails
      // The user will need to use the resend button instead
    },
    onSettled: () => {
      setVerifying(false);
    }
  });

  // Parse parameters from URL query parameters
  useEffect(() => {
    // Don't try to verify if already verified or if already attempted and failed
    if (verified || error) {
      return;
    }
    
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const hash = params.get('hash');
    const emailParam = params.get('email');
    const expires = params.get('expires');
    const signature = params.get('signature');
    
    if (emailParam) setEmail(emailParam);
    
    console.log('URL Search Params:', {
      id, hash, email: emailParam, expires, signature,
      fullSearch: location.search
    });
    
    // Check if we're dealing with a direct verification URL from the email
    if (expires && signature) {
      console.log('Received direct verification URL with expires and signature');
      verifyWithFullUrl();
    }
    // If we have id and hash, attempt to verify with those
    else if (id && hash) {
      console.log('Received id and hash for verification');
      verifyWithIdAndHash(id, hash);
    } 
    // Special case for the URL format like: http://localhost:5173/verify-email?expires=1745789593&signature=32604500e45984
    else if (location.search.includes('expires=') && location.search.includes('signature=')) {
      console.log('Received verification URL with expires and signature only (no parameters detected)');
      verifyWithFullUrl();
    }
  }, [location, verified, error]);

  const verifyWithIdAndHash = (id: string, hash: string) => {
    setVerifying(true);
    setError('');
    console.log('Verifying email with id:', id, 'and hash:', hash);
    verifyEmailMutation.mutate({ id, hash });
  };
  
  const verifyWithFullUrl = () => {
    setVerifying(true);
    setError('');
    // Get the full current URL for verification
    const fullUrl = window.location.href;
    console.log('Verifying with full URL:', fullUrl);
    verifyEmailMutation.mutate({ url: fullUrl });
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email is required to resend verification');
      return;
    }
    
    setResendLoading(true);
    setError('');
    
    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
    } catch (error) {
      console.error('Error resending verification email:', error);
      setError('Failed to resend verification email. Please try again later.');
    } finally {
      setResendLoading(false);
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
            <h2 className="text-2xl font-bold">Email Verification</h2>
          </div>

          <Card>
            <CardContent className="pt-6">
              {verifying ? (
                <div className="text-center py-12">
                  <Loader />
                  <p className="mt-4">Verifying your email...</p>
                </div>
              ) : verified ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Email Verified!</h3>
                  <p className="mb-6 text-gray-600">
                    Your email has been verified successfully.
                    You'll be redirected to login.
                  </p>
                  <Button asChild>
                    <Link to="/login">Continue to Login</Link>
                  </Button>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Verification Failed</h3>
                  <p className="mb-6 text-red-600">{error}</p>
                  
                  {email && (
                    <div className="mt-6">
                      <p className="mb-4 text-gray-600">
                        Need a new verification link?
                      </p>
                      <div className="space-y-4">
                        <Button 
                          onClick={handleResendVerification}
                          disabled={resendLoading || resendSuccess}
                          variant="outline"
                          className="mb-2"
                        >
                          {resendLoading ? 'Sending...' : 
                           resendSuccess ? 'Email Sent' : 'Resend Verification Email'}
                        </Button>
                        
                        {resendSuccess && (
                          <p className="text-green-600 text-sm">
                            A new verification link has been sent to your email.
                          </p>
                        )}
                        
                        <div className="mt-2">
                          <Button
                            onClick={() => {
                              // Clear error state and attempt verification again
                              setError('');
                              if (location.search.includes('id=') && location.search.includes('hash=')) {
                                const params = new URLSearchParams(location.search);
                                const id = params.get('id');
                                const hash = params.get('hash');
                                if (id && hash) {
                                  verifyWithIdAndHash(id, hash);
                                }
                              } else {
                                verifyWithFullUrl();
                              }
                            }}
                            variant="default"
                          >
                            Try Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Link to="/login" className="text-course-blue hover:underline">
                      Back to Login
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Verify Your Email</h3>
                  <p className="mb-6 text-gray-600">
                    {email ? (
                      <>
                        We've sent a verification link to <strong>{email}</strong>.
                        Click the link in the email to verify your account.
                      </>
                    ) : (
                      <>
                        Please check your email for a verification link,
                        or enter your email below to resend the verification link.
                      </>
                    )}
                  </p>
                  
                  {email && (
                    <Button 
                      onClick={handleResendVerification}
                      disabled={resendLoading || resendSuccess}
                      variant="outline"
                      className="mb-4"
                    >
                      {resendLoading ? 'Sending...' : 
                       resendSuccess ? 'Email Sent' : 'Resend Verification Email'}
                    </Button>
                  )}
                  
                  <div className="mt-4">
                    <Link to="/login" className="text-course-blue hover:underline">
                      Back to Login
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default VerifyEmailPage; 