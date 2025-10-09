import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import shieldIcon from '@/assets/icons/shield.svg';
import heroProfessional from '@/assets/hero-professional.svg';
import champions from '@/assets/icons/champions.svg';

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 lg:py-20 bg-primary-light/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 lg:space-y-8">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <img src={shieldIcon} alt="Shield" className="w-8 h-8 brightness-0 invert" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}>
              {t('hero.title')}
            </h1>
            
            <p className="text-xl lg:text-2xl font-bold text-primary" style={{ fontSize: 'clamp(1.125rem, 2vw, 1.25rem)' }}>
              {t('hero.subtitle')}
            </p>
            
            <p className="text-base lg:text-lg text-body max-w-lg font-normal leading-relaxed" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}>
              {t('hero.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="text-base px-8 py-6" asChild>
                <Link to="/dashboard">{t('hero.cta.primary')}</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6" asChild>
                <Link to="/dashboard">{t('hero.cta.secondary')}</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={heroProfessional}
                alt="Professional executive"
                className="w-full h-auto"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <img src={champions} alt="Champions" className="w-6 h-6 brightness-0 invert" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{t('hero.badge.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('hero.badge.subtitle')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
