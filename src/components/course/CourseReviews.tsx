import { Button } from '@/components/ds/primitives/Button';
import { Star } from 'lucide-react';

interface CourseReviewsProps {
  category: string;
}

export const CourseReviews = ({ category }: CourseReviewsProps) => {
  return (
    <div className="bg-[#1e293b] border border-neutral-700 rounded-xl p-6">
      <h2 className="font-serif text-2xl font-bold text-neutral-50 mb-6">
        Student Reviews
      </h2>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-neutral-700 pb-6 last:border-0"
          >
            <div className="flex items-start mb-3 gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=User+${i + 1}&size=40&background=random`}
                alt={`User ${i + 1}`}
                className="rounded-full w-10 h-10 flex-shrink-0"
              />
              <div>
                <h4 className="font-medium text-neutral-100">
                  Student {i + 1}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={13}
                        className={
                          j < 5 - (i % 2)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-600'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-neutral-500 text-xs">
                    {new Date(
                      Date.now() - i * 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-neutral-300 text-sm leading-relaxed">
              {i === 0
                ? `This is an excellent course! The instructor explains complex concepts in a way that's easy to understand. I've learned so much and feel confident applying these skills in real-world scenarios.`
                : i === 1
                  ? `Great content and well-structured lessons. The practical examples really helped solidify my understanding. Highly recommend for anyone looking to learn ${category}.`
                  : `The course exceeded my expectations. It's comprehensive, engaging, and the instructor is clearly knowledgeable. I've already started applying what I've learned to my projects.`}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button variant="secondary">Read More Reviews</Button>
      </div>
    </div>
  );
};
