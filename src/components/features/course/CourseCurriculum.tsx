// src/components/features/course/CourseCurriculum.tsx
import { Card, CardContent } from '@/components/ds/primitives/Card';
import { Badge } from '@/components/ds/primitives/Badge';
import { Progress } from '@/components/ds/primitives/Progress';

export interface CurriculumSection {
  id: string;
  title: string;
  lessons: { id: string; title: string; duration?: string }[];
  completedCount?: number;
}

export interface CourseCurriculumProps {
  sections: CurriculumSection[];
}

export function CourseCurriculum({ sections }: CourseCurriculumProps) {
  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const total = section.lessons.length;
        const completed = section.completedCount ?? 0;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <Card key={section.id} variant="flat">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-neutral-100">
                  {section.title}
                </h4>
                <Badge variant="outline" size="sm">
                  {total} lessons
                </Badge>
              </div>
              {completed > 0 && (
                <Progress value={pct} variant="default" size="sm" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
