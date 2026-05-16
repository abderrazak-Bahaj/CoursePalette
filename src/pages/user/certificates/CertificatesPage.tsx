import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ds/primitives/Card';
import { Button } from '@/components/ds/primitives/Button';
import { Link } from 'react-router-dom';
import { Award, Download, Share2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { certificateService } from '@/services/api/certificateService';
import { format } from 'date-fns';
import CertificatesSection from '@/components/dashboard/CertificatesSection';

const CertificatesPage = () => {
  return (
    <MainLayout>
      <div className="bg-[#0f172a] py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <div className="rounded-full bg-violet-600/10 p-3 mr-4">
              <Award className="h-8 w-8 text-violet-400" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-neutral-50 mb-1">
                My Certificates
              </h1>
              <p className="text-neutral-400">
                View and share your earned certificates
              </p>
            </div>
          </div>

          <CertificatesSection showTitle={false} />
        </div>
      </div>
    </MainLayout>
  );
};

interface CertificateCardProps {
  certificate: {
    id: number;
    certificate_number: string;
    issue_date: string;
    metadata: {
      completion_date: string;
      grade: string;
    };
    course: {
      id: number;
      title: string;
      level: string;
    };
    user: {
      name: string;
    };
  };
}

const CertificateCard = ({ certificate }: CertificateCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card variant="accent" accentColor="amber" className="overflow-hidden">
      <div className="bg-[#0f172a] border-b border-neutral-700 text-neutral-50 p-4 flex items-center justify-between">
        <h3 className="font-semibold line-clamp-1">
          {certificate.course.title}
        </h3>
        <Award className="h-5 w-5" />
      </div>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="aspect-[16/12] mb-4 relative">
            {/* Certificate preview */}
            <div className="absolute inset-0 bg-[#0f172a] border border-neutral-700 rounded flex items-center justify-center">
              <div className="text-center p-4 border-4 border-gray-300 w-full h-full flex flex-col items-center justify-center">
                <div className="font-serif text-lg font-bold text-neutral-50 mb-2">
                  CERTIFICATE
                </div>
                <div className="text-sm text-neutral-300 mb-1">
                  This certifies that
                </div>
                <div className="font-serif text-xl font-bold text-neutral-50 mb-1">
                  {certificate.user.name}
                </div>
                <div className="text-sm text-neutral-300 mb-3">
                  successfully completed
                </div>
                <div className="text-lg font-semibold mb-1">
                  {certificate.course.title}
                </div>
                <div className="text-sm text-neutral-500">
                  Issued on {formatDate(certificate.issue_date)}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-neutral-500 mb-1">Course</div>
            <Link
              to={`/courses/${certificate.course.id}`}
              className="font-medium text-neutral-100 hover:text-violet-400 transition-colors line-clamp-2"
            >
              {certificate.course.title}
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-neutral-500 mb-1">Issue Date</div>
              <div className="text-sm">
                {formatDate(certificate.issue_date)}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-500 mb-1">Credential ID</div>
              <div className="text-sm">{certificate.certificate_number}</div>
            </div>
          </div>
        </div>

        <div className="flex p-4">
          <Button
            asChild
            variant="success"
            className="mr-2 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Link to={`/courses/${certificate.course.id}/certificate`}>
              View
            </Link>
          </Button>
          {/*  <Button
            variant="outline"
            size="icon"
            className="mr-2"
            onClick={(e) => {
              e.stopPropagation();
              // Download functionality would be implemented here
              alert('Certificate download started');
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              // Share functionality would be implemented here
              alert('Share certificate');
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificatesPage;
