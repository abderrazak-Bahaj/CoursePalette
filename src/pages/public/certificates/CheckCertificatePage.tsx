import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { certificateService } from '@/services/api/certificateService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import DisplayCertificate from '@/components/certificate/DisplayCertificate';
import MainLayout from '@/components/layout/MainLayout';

const CheckCertificatePage = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['checkCertificate', certificateNumber],
    queryFn: () =>
      certificateService.checkCertificateByNumber(certificateNumber),
    enabled: isSubmitted && certificateNumber.length > 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Verify Certificate</CardTitle>
            <CardDescription>
              Enter your certificate number to verify its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter certificate number"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Certificate
              </Button>
            </form>

            {isSubmitted && (
              <div className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {error instanceof Error
                        ? error.message
                        : 'Failed to verify certificate'}
                    </AlertDescription>
                  </Alert>
                ) : data?.certificates?.[0] ? (
                  <>
                    <Alert
                      variant="default"
                      className="mb-4 bg-green-50 text-green-800 border-green-200"
                    >
                      <AlertTitle>Certificate Verified</AlertTitle>
                      <AlertDescription>
                        This certificate has been successfully verified.
                      </AlertDescription>
                    </Alert>
                    <DisplayCertificate certificate={data.certificates[0]} />
                  </>
                ) : (
                  <Alert variant="destructive">
                    <AlertTitle>Certificate Not Found</AlertTitle>
                    <AlertDescription>
                      No certificate found with the provided number.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CheckCertificatePage;
