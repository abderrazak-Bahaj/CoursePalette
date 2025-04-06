import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CertificateCardProps {
  id: string;
  title: string;
  courseName: string;
  image: string;
  issueDate: string;
}

const CertificateCard = ({
  id,
  title,
  courseName,
  image,
  issueDate,
}: CertificateCardProps) => {
  return (
    <Card key={id} className="overflow-hidden course-card-shadow">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold line-clamp-1">{title}</h3>
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <img
            src={image}
            alt={title}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Course</div>
          <div className="font-medium line-clamp-2">{courseName}</div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Issued</div>
            <div className="text-sm">{issueDate}</div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to={`/certificates/${id}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateCard;
