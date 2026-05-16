import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ds/primitives/Card';
import { Button } from '@/components/ds/primitives/Button';

interface CertificateCardProps {
  id: string;
  title: string;
  image: string;
  issueDate: string;
}

const CertificateCard = ({
  id,
  title,
  image,
  issueDate,
}: CertificateCardProps) => {
  return (
    <Card variant="accent" accentColor="amber" className="overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-4">
          <img
            src={image}
            alt={title}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
        <div className="mb-4">
          <div className="text-sm text-neutral-400 mb-1">Course</div>
          <div className="font-medium text-neutral-100 line-clamp-2">
            {title}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-400 mb-1">Issued</div>
            <div className="text-sm text-neutral-300">{issueDate}</div>
          </div>
          <Button asChild size="sm" variant="success">
            <Link to={`/certificates/${id}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateCard;
