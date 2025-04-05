
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import TestimonialSection from "@/components/home/TestimonialSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import CtaSection from "@/components/home/CtaSection";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect admin users to dashboard
  useEffect(() => {
    if (user?.role === "ADMIN") {
      navigate("/dashboard");
    }
  }, [user, navigate]);



        
  return (
    <MainLayout>
      <HeroSection />
      <CategorySection />
      <FeaturedCourses 
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
