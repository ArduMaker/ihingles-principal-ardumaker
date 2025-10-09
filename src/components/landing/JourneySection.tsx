import { Card } from '@/components/ui/card';
import { mockJourneySteps } from '@/data/landing';
import { useLanguage } from '@/contexts/LanguageContext';
import shieldIcon from '@/assets/icons/shield.svg';
import crownIcon from '@/assets/icons/crown.svg';
import championsIcon from '@/assets/icons/champions.svg';

const levelIcons = {
  'Nayire': shieldIcon,
  'Knight': crownIcon,
  'Duke': championsIcon
};

const translations = {
  en: {
    title: 'Your Learning Journey'
  },
  es: {
    title: 'Tu Viaje de Aprendizaje'
  }
};

export const JourneySection = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,5vw,3.75rem)] font-bold mb-4 text-heading">
            {t.title}
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Card className="p-12 bg-card border-border shadow-sm">
            <div className="space-y-12">
              {mockJourneySteps.map((step, index) => (
                <div key={step.id} className="flex gap-6 items-start">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                      <img 
                        src={levelIcons[step.level as keyof typeof levelIcons]} 
                        alt={step.level} 
                        className="w-8 h-8"
                      />
                    </div>
                    {index < mockJourneySteps.length - 1 && (
                      <div className="w-0.5 h-20 bg-primary mt-4" />
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-bold mb-2 text-heading">{step.title}</h3>
                    <p className="text-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
