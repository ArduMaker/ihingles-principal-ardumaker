import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import shieldIcon from '@/assets/icons/shield.svg';
import heroProfessional from '@/assets/hero-professional.svg';
import champions from '@/assets/icons/champions.svg';

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="py-8 sm:py-12 lg:py-20 bg-primary-light/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center">
              <img src={shieldIcon} alt="Shield" className="w-6 h-6 sm:w-8 sm:h-8 brightness-0 invert" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              {t('hero.title')}
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
              {t('hero.subtitle')}
            </p>
            
            <p className="text-base sm:text-lg text-body max-w-lg font-normal leading-relaxed">
              {t('hero.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto" asChild>
                <Link to="/dashboard">{t('hero.cta.primary')}</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto" asChild>
                <Link to="/dashboard">{t('hero.cta.secondary')}</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative mt-8 lg:mt-0">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl">
              <img 
                src={heroProfessional}
                alt="Professional executive"
                className="w-full h-auto"
              />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-background/95 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <img src={champions} alt="Champions" className="w-5 h-5 sm:w-6 sm:h-6 brightness-0 invert" />
                  </div>
                  <div>
                    <p className="font-bold text-sm sm:text-base">{t('hero.badge.title')}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('hero.badge.subtitle')}</p>
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
