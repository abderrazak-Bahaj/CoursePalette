import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface CourseReviewsProps {
  category: string;
}

export const CourseReviews = ({ category }: CourseReviewsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-b pb-6 last:border-0">
            <div className="flex items-start mb-4">
              <img
                src={`https://ui-avatars.com/api/?name=User+${i + 1}&size=40&background=random`}
                alt={`User ${i + 1}`}
                className="rounded-full w-10 h-10 mr-3"
              />
              <div>
                <h4 className="font-medium">Student {i + 1}</h4>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={14}
                        className={`${
                          j < 5 - (i % 2)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {new Date(
                      Date.now() - i * 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <p>
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
        <Button variant="outline">Read More Reviews</Button>
      </div>
    </div>
  );
};
