
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
  category: string;
  level: string;
}

const CourseCard = ({
  id,
  title,
  instructor,
  image,
  rating,
  reviewCount,
  price,
  category,
  level,
}: CourseCardProps) => {
  return (
    <Link to={`/courses/${id}`}>
      <Card className="overflow-hidden h-full course-card-shadow course-card-hover">
        <div className="relative h-40 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <Badge className="absolute top-2 right-2 bg-course-blue">{level}</Badge>
        </div>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 mb-2">{instructor}</p>
          <div className="flex items-center space-x-1 mb-2">
            <span className="font-medium">{rating.toFixed(1)}</span>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${
                    i < Math.floor(rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({reviewCount})</span>
          </div>
          <Badge variant="outline" className="bg-gray-50">
            {category}
          </Badge>
        </CardContent>
        <CardFooter className="border-t pt-3 pb-4">
          <div className="w-full flex justify-between items-center">
            <span className="font-bold text-lg">${price.toFixed(2)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CourseCard;
