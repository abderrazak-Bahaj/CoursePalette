// src/components/features/course/CourseHeader.tsx
import { Badge } from '@/components/ds/primitives/Badge';
import { Button } from '@/components/ds/primitives/Button';
import { Avatar } from '@/components/ds/primitives/Avatar';
import { cn } from '@/lib/utils';

export interface CourseHeaderProps {
  title: string;
  description?: string;
  instructor?: { name: string; avatar?: string };
  category?: string;
  level?: string;
  price?: number;
  enrolled?: boolean;
  onEnroll?: () => void;
}

export function CourseHeader({
  title,
  description,
  instructor,
  category,
  level,
  price,
  enrolled = false,
  onEnroll,
}: CourseHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {category && <Badge variant="primary">{category}</Badge>}
        {level && <Badge variant="outline">{level}</Badge>}
      </div>
      <h1 className="font-serif text-4xl font-bold text-neutral-50">{title}</h1>
      {description && <p className="text-neutral-400 text-lg">{description}</p>}
      {instructor && (
        <div className="flex items-center gap-3">
          <Avatar
            src={instructor.avatar}
            alt={instructor.name}
            fallback={instructor.name.slice(0, 2)}
            size="sm"
            role="teacher"
          />
          <span className="text-sm text-neutral-300">{instructor.name}</span>
        </div>
      )}
      <div className="flex items-center gap-4">
        {price !== undefined && (
          <span className="text-2xl font-bold text-amber-400">
            ${Number(price).toFixed(2)}
          </span>
        )}
        {!enrolled && (
          <Button variant="action" size="lg" onClick={onEnroll}>
            Enroll Now
          </Button>
        )}
        {enrolled && <Badge variant="success">Enrolled</Badge>}
      </div>
    </div>
  );
}
