
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User, Clock, BarChart, Star, Calendar, Video, Play, Lock, Check, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { mockCourses } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import CourseCard from "@/components/course/CourseCard";

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Find the course by ID
  const course = mockCourses.find((course) => course.id === id);

  // Get related courses from the same category
  const relatedCourses = mockCourses
    .filter((c) => c.category === course?.category && c.id !== id)
    .slice(0, 4);

  if (!course) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="mb-6">The course you are looking for does not exist.</p>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in or register to enroll in this course.",
        variant: "destructive",
      });
      return;
    }

    setIsEnrolled(true);
    toast({
      title: "Enrollment Successful",
      description: `You have successfully enrolled in "${course.title}"`,
    });
  };

  return (
    <MainLayout>
      {/* Course header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg mb-4">{course.description}</p>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-yellow-400 h-5 w-5 mr-1" />
                  <span className="font-medium mr-1">{course.rating.toFixed(1)}</span>
                  <span className="text-gray-300">({course.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-1 text-gray-300" />
                  <span>{course.enrolledCount} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-1 text-gray-300" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-1 text-gray-300" />
                  <span>Last updated {course.lastUpdated}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-1 text-gray-300" />
                  <span>{course.language}</span>
                </div>
              </div>

              <div className="flex items-center mb-6">
                <span className="text-gray-300 mr-2">Created by</span>
                <Link to="#" className="text-course-blue hover:underline">
                  {course.instructor}
                </Link>
              </div>

              {isEnrolled ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-course-blue">
                    <Link to={`/courses/${id}/learn`}>Continue Learning</Link>
                  </Button>
                  <div className="flex-1 flex items-center">
                    <div className="w-full">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Your progress</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="bg-course-blue"
                  onClick={handleEnroll}
                >
                  Enroll Now
                </Button>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-lg overflow-hidden shadow-xl bg-gray-800">
                <div className="relative aspect-video">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 h-16 w-16"
                    >
                      <Play className="h-8 w-8 text-white" fill="white" />
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold">${course.price.toFixed(2)}</div>
                  </div>
                  <Button
                    className="w-full mb-3 bg-course-blue"
                    size="lg"
                    onClick={handleEnroll}
                  >
                    {isEnrolled ? "Already Enrolled" : "Enroll Now"}
                  </Button>
                  <p className="text-center text-sm mb-4">
                    30-day money-back guarantee
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Video className="h-5 w-5 mr-2 mt-0.5 text-gray-300" />
                      <span>{course.duration} of on-demand video</span>
                    </div>
                    <div className="flex items-start">
                      <BarChart className="h-5 w-5 mr-2 mt-0.5 text-gray-300" />
                      <span>
                        {course.level} level
                      </span>
                    </div>
                    <div className="flex items-start">
                      <Globe className="h-5 w-5 mr-2 mt-0.5 text-gray-300" />
                      <span>
                        {course.language}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="curriculum">
          <TabsList className="mb-8">
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Course Content</h2>
              <div className="text-sm text-gray-500 mb-6">
                {course.lessons?.length || 0} lessons • {course.duration} total length
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="section-1">
                  <AccordionTrigger>
                    <div className="text-left">
                      <div className="font-semibold">
                        Section 1: Introduction
                      </div>
                      <div className="text-sm text-gray-500">
                        {course.lessons?.filter((_, i) => i < 2).length || 0} lessons • 
                        {course.lessons?.filter((_, i) => i < 2).reduce((acc, lesson) => {
                          const [mins, secs] = lesson.duration.split(':').map(Number);
                          return acc + mins + secs / 60;
                        }, 0).toFixed(0) || 0} mins
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-4">
                      {course.lessons?.filter((_, i) => i < 2).map((lesson) => (
                        <li key={lesson.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            {lesson.isPreview ? (
                              <Play className="h-5 w-5 mr-3 text-course-blue" />
                            ) : (
                              <Lock className="h-5 w-5 mr-3 text-gray-400" />
                            )}
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm text-gray-500">
                                {lesson.duration}
                              </div>
                            </div>
                          </div>
                          {lesson.isPreview && (
                            <Badge variant="outline">Preview</Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="section-2">
                  <AccordionTrigger>
                    <div className="text-left">
                      <div className="font-semibold">
                        Section 2: Getting Started
                      </div>
                      <div className="text-sm text-gray-500">
                        {course.lessons?.filter((_, i) => i >= 2).length || 0} lessons • 
                        {course.lessons?.filter((_, i) => i >= 2).reduce((acc, lesson) => {
                          const [mins, secs] = lesson.duration.split(':').map(Number);
                          return acc + mins + secs / 60;
                        }, 0).toFixed(0) || 0} mins
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-4">
                      {course.lessons?.filter((_, i) => i >= 2).map((lesson) => (
                        <li key={lesson.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Lock className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm text-gray-500">
                                {lesson.duration}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="overview">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">About This Course</h2>
              <p className="mb-6">{course.description}</p>

              <h3 className="text-xl font-bold mb-4">What You'll Learn</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {course.skills?.map((skill, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-bold mb-4">Requirements</h3>
              <ul className="list-disc pl-5 mb-8 space-y-2">
                <li>No prior knowledge is required - we'll teach you everything you need to know</li>
                <li>A computer with internet access</li>
                <li>Enthusiasm and determination to learn</li>
              </ul>

              <h3 className="text-xl font-bold mb-4">Who this course is for:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Anyone interested in learning {course.category}</li>
                <li>Students looking to gain practical skills in {course.category}</li>
                <li>Professionals wanting to upskill or change careers</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="instructor">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Your Instructor</h2>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={`https://ui-avatars.com/api/?name=${course.instructor.split(' ').join('+')}&size=128&background=random`}
                    alt={course.instructor}
                    className="rounded-full w-24 h-24 object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{course.instructor}</h3>
                  <p className="text-gray-500 mb-4">Expert in {course.category}</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center">
                      <Star className="text-yellow-400 fill-yellow-400 h-5 w-5 mr-1" />
                      <span className="font-medium">4.8 Instructor Rating</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-1 text-gray-500" />
                      <span>50,000+ Students</span>
                    </div>
                    <div className="flex items-center">
                      <Video className="h-5 w-5 mr-1 text-gray-500" />
                      <span>10+ Courses</span>
                    </div>
                  </div>
                  <p className="mb-4">
                    {course.instructor} is a highly experienced educator with over 10 years of professional experience in {course.category}. They've helped thousands of students achieve their learning goals through practical, hands-on courses.
                  </p>
                  <p>
                    Their teaching approach focuses on real-world applications, making complex concepts easy to understand for students of all levels. With a passion for teaching and a deep understanding of industry best practices, they're committed to helping you succeed in your learning journey.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="md:w-1/4 text-center">
                  <div className="text-5xl font-bold text-yellow-500 mb-2">
                    {course.rating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={`${
                          i < Math.floor(course.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-gray-500">
                    Course Rating • {course.reviewCount} Reviews
                  </div>
                </div>
                <div className="md:w-3/4">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      // Calculate percentage based on rating
                      const percent =
                        star === 5
                          ? 70
                          : star === 4
                          ? 20
                          : star === 3
                          ? 7
                          : star === 2
                          ? 2
                          : 1;
                      return (
                        <div key={star} className="flex items-center">
                          <div className="w-1/6 flex items-center">
                            <span className="mr-2">{star}</span>
                            <Star
                              size={14}
                              className="text-yellow-400 fill-yellow-400"
                            />
                          </div>
                          <div className="w-4/6">
                            <div className="h-2 w-full bg-gray-200 rounded-full">
                              <div
                                className="h-2 bg-yellow-400 rounded-full"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-1/6 pl-2 text-gray-500 text-sm">
                            {percent}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Sample reviews */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border-b pb-6 last:border-0">
                    <div className="flex items-start mb-4">
                      <img
                        src={`https://ui-avatars.com/api/?name=User+${i+1}&size=40&background=random`}
                        alt={`User ${i+1}`}
                        className="rounded-full w-10 h-10 mr-3"
                      />
                      <div>
                        <h4 className="font-medium">Student {i+1}</h4>
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star
                                key={j}
                                size={14}
                                className={`${
                                  j < 5 - (i % 2)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
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
                        ? `Great content and well-structured lessons. The practical examples really helped solidify my understanding. Highly recommend for anyone looking to learn ${course.category}.`
                        : `The course exceeded my expectations. It's comprehensive, engaging, and the instructor is clearly knowledgeable. I've already started applying what I've learned to my projects.`}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button variant="outline">Read More Reviews</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related courses */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Related Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseDetailPage;
