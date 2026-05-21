import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import TestimonialSection from '@/components/home/TestimonialSection';
import StatisticsSection from '@/components/home/StatisticsSection';
import CtaSection from '@/components/home/CtaSection';
import { useAuth } from '@/hooks/useAuth';
import { useSEO } from '@/hooks/useSEO';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: 'AI-Powered Online Courses & Learning Paths',
    description:
      "Master new skills with Skillorai's intelligent learning platform. Expert-led courses, AI-powered assignments, personalized paths, and verified certificates.",
    keywords:
      'online courses, e-learning, AI learning, programming, data science, web development, certificates, Skillorai',
  });

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <MainLayout>
      <HeroSection />
      <HowItWorksSection />
      <FeaturedCourses
        title="Top-Rated Courses"
        description="Explore our highest-rated courses across different categories"
      />
      <CategorySection />
      <StatisticsSection />
      <CtaSection />
      <TestimonialSection />
    </MainLayout>
  );
};

export default Index;
