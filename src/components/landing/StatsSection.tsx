import { Card } from '@/components/ui/card';
import { mockStats } from '@/data/landing';
import { useLanguage } from '@/contexts/LanguageContext';
import calendarIcon from '@/assets/icons/calendar.svg';
import trendingIcon from '@/assets/icons/trending.svg';
import peopleIcon from '@/assets/icons/people.svg';
import starIcon from '@/assets/icons/star.svg';

const iconMap = {
  calendar: calendarIcon,
  'trending-up': trendingIcon,
  'book-open': peopleIcon,
  star: starIcon,
};

const translations = {
  en: {
    title: 'Measurable Transformation',
    subtitle: 'Real results for serious professionals who demand excellence.'
  },
  es: {
    title: 'Transformación Medible',
    subtitle: 'Resultados reales para profesionales serios que exigen excelencia.'
  }
};

export const StatsSection = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,5vw,3.75rem)] font-bold mb-4 text-heading">
            {t.title}
          </h2>
          <p className="text-[clamp(1rem,2vw,1.25rem)] text-foreground">
            {t.subtitle}
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockStats.map((stat) => {
            const icon = iconMap[stat.icon as keyof typeof iconMap];
            return (
              <Card key={stat.id} className="p-8 text-center hover-lift bg-card border-border shadow-sm">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
                  <img src={icon} alt="" className="w-7 h-7" />
                </div>
                <p className="text-4xl font-bold text-heading mb-2">{stat.value}</p>
                <p className="text-foreground text-sm">{stat.label}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
