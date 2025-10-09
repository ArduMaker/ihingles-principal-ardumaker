import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import crownIcon from '@/assets/icons/crown.svg';
import chatIcon from '@/assets/icons/chat.svg';
import flagIcon from '@/assets/icons/flag.svg';

export const MethodSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: crownIcon,
      titleKey: 'method.card1.title',
      descriptionKey: 'method.card1.description',
      badgeKey: 'method.card1.badge',
    },
    {
      icon: chatIcon,
      titleKey: 'method.card2.title',
      descriptionKey: 'method.card2.description',
      badgeKey: 'method.card2.badge',
    },
    {
      icon: flagIcon,
      titleKey: 'method.card3.title',
      descriptionKey: 'method.card3.description',
      badgeKey: 'method.card3.badge',
    },
  ];

  return (
    <section id="method" className="py-16 lg:py-24 bg-primary-light/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            {t('method.title')}
          </h2>
          <p className="text-base lg:text-lg text-body max-w-3xl mx-auto font-normal leading-relaxed" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}>
            {t('method.description')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 lg:p-8 hover-lift bg-background border-0 shadow-md">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-primary flex items-center justify-center mb-6">
                <img src={feature.icon} alt="Icon" className="w-7 h-7 lg:w-8 lg:h-8 brightness-0 invert" />
              </div>
              
              <h3 className="text-xl lg:text-2xl font-bold mb-4" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}>{t(feature.titleKey)}</h3>
              <p className="text-body mb-6 text-base lg:text-lg font-normal leading-relaxed" style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>{t(feature.descriptionKey)}</p>
              
              <div className="flex items-center gap-2 text-primary">
                <Check className="w-5 h-5" />
                <span className="text-sm lg:text-base font-semibold">{t(feature.badgeKey)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
