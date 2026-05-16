// src/components/features/dashboard/CertificateCard.tsx
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ds/primitives/Card';
import { Badge } from '@/components/ds/primitives/Badge';
import { Button } from '@/components/ds/primitives/Button';

export interface CertificateCardProps {
  id: string;
  title: string;
  image?: string;
  issueDate?: string;
}

export function CertificateCard({
  id,
  title,
  image,
  issueDate,
}: CertificateCardProps) {
  return (
    <Card variant="accent" accentColor="amber" className="overflow-hidden">
      <CardContent className="pt-4">
        {image && (
          <div className="mb-3">
            <img
              src={image}
              alt={title}
              className="w-full h-28 object-cover rounded-md"
            />
          </div>
        )}
        <Badge variant="success" size="sm" className="mb-2">
          Certificate
        </Badge>
        <h3 className="font-medium text-neutral-100 line-clamp-2 mb-2">
          {title}
        </h3>
        {issueDate && (
          <p className="text-xs text-neutral-500 mb-3">Issued {issueDate}</p>
        )}
        <Button variant="success" size="sm" asChild className="w-full">
          <Link to={`/certificates/${id}`}>View Certificate</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
