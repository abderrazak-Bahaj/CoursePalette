// src/components/features/course/CourseInstructor.tsx
import { Card, CardContent } from '@/components/ds/primitives/Card';
import { Avatar } from '@/components/ds/primitives/Avatar';

export interface CourseInstructorProps {
  name: string;
  bio?: string;
  avatar?: string;
  courseCount?: number;
  studentCount?: number;
}

export function CourseInstructor({
  name,
  bio,
  avatar,
  courseCount,
  studentCount,
}: CourseInstructorProps) {
  return (
    <Card variant="elevated">
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <Avatar
            src={avatar}
            alt={name}
            fallback={name.slice(0, 2)}
            size="lg"
            role="teacher"
          />
          <div>
            <h3 className="font-serif font-semibold text-neutral-50">{name}</h3>
            {bio && <p className="text-sm text-neutral-400 mt-1">{bio}</p>}
            <div className="flex gap-4 mt-2 text-xs text-neutral-500">
              {courseCount !== undefined && <span>{courseCount} courses</span>}
              {studentCount !== undefined && (
                <span>{studentCount} students</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
