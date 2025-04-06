import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockCertificates } from '@/data/mockData';
import CertificateCard from './CertificateCard';

const CertificatesSection = () => {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Certificates</h2>
        <Button asChild variant="outline">
          <Link to="/certificates">View All</Link>
        </Button>
      </div>

      {mockCertificates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            You haven't earned any certificates yet. Complete a course to earn
            one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mockCertificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              id={certificate.id}
              title={certificate.title}
              courseName={certificate.courseName}
              image={certificate.image}
              issueDate={certificate.issueDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesSection;
