import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockCertificates } from '@/data/mockData';
import CertificateCard from './CertificateCard';
import { useQuery } from '@tanstack/react-query';
import { certificateService } from '@/services/api';
import WrapperLoading from '../ui/wrapper-loading';
import { format } from 'date-fns';

const CertificatesSection = ({ showTitle = true }: { showTitle?: boolean }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateService.getCertificates(),
  });

  const certificates = data?.certificates || [];

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-2 text-red-600">
            Error Loading Certificates
          </h2>
          <p className="text-gray-500 mb-6">
            There was an error loading your certificates. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        {showTitle && (
          <>
            <h2 className="text-2xl font-bold">My Certificates</h2>
            <Button asChild variant="outline">
              <Link to="/certificates">View All</Link>
            </Button>
          </>
        )}
      </div>

      <WrapperLoading isLoading={isLoading} error={error}>
        {certificates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              You haven't earned any certificates yet. Complete a course to earn
              one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                id={certificate.course.id}
                title={certificate.course.title}
                image={certificate.course.image_url}
                issueDate={formatDate(certificate.issue_date)}
              />
            ))}
          </div>
        )}
      </WrapperLoading>
    </div>
  );
};

export default CertificatesSection;

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMMM d, yyyy');
  } catch (error) {
    return dateString;
  }
};
