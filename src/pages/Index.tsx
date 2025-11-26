import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { MethodSection } from '@/components/landing/MethodSection';
import { LexoSection } from '@/components/landing/LexoSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { JourneySection } from '@/components/landing/JourneySection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CommunitySection } from '@/components/landing/CommunitySection';
import { Footer } from '@/components/landing/Footer';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Index = () => {
  const navigate = useNavigate();

  // Si tenemos una cookie de login, y tenemos cookie de authenticación, redirigimos al dashboard
  useEffect(()=>{
    const loginCookie = Cookies.get('login');
    const authCookie = Cookies.get('Autenticacion');
    if (loginCookie && authCookie) {
      Cookies.remove('login', { path: '/' });
      navigate('/dashboard');
    }
  }, [window.location.pathname])

  return (
    <div className="landing-page min-h-screen">
      <Header />
      <Hero />
      <MethodSection />
      <LexoSection />
      <StatsSection />
      <JourneySection />
      <TestimonialsSection />
      <CommunitySection />
      <Footer />
    </div>
  );
};

export default Index;
