import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ds/primitives/Card';
import { Badge } from '@/components/ds/primitives/Badge';

export interface CategoryItem {
  id: string;
  name: string;
  courseCount?: number;
  icon?: string;
}

export interface CategorySectionProps {
  categories: CategoryItem[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="py-12 bg-[#1e293b]/30">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-3xl font-bold text-neutral-50 mb-8">
          Browse Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/categories/${cat.id}`}>
              <Card variant="interactive" size="sm">
                <CardContent className="pt-3 text-center">
                  {cat.icon && (
                    <span className="text-2xl mb-2 block">{cat.icon}</span>
                  )}
                  <p className="font-medium text-neutral-100 text-sm">
                    {cat.name}
                  </p>
                  {cat.courseCount !== undefined && (
                    <Badge variant="outline" size="sm" className="mt-1">
                      {cat.courseCount} courses
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
