import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { MethodSection } from '@/components/landing/MethodSection';
import { LexoSection } from '@/components/landing/LexoSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { JourneySection } from '@/components/landing/JourneySection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CommunitySection } from '@/components/landing/CommunitySection';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
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
