
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import TestimonialSection from "@/components/home/TestimonialSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import CtaSection from "@/components/home/CtaSection";
import { mockCourses } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect admin users to dashboard
  useEffect(() => {
    if (user?.isAdmin) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Get top-rated courses for the featured section
  const featuredCourses = [...mockCourses]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  return (
    <MainLayout>
      <HeroSection />
      <CategorySection />
      <FeaturedCourses 
        courses={featuredCourses} 
        title="Top-Rated Courses"
        description="Explore our highest-rated courses across different categories"
      />
      <TestimonialSection />
      <StatisticsSection />
      <CtaSection />
    </MainLayout>
  );
};

export default Index;
