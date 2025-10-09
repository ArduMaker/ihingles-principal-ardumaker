import { Card } from '@/components/ui/card';
import { mockTestimonials } from '@/data/landing';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

const achievementIcons = {
  'Raised $2M via English': DollarSign,
  'Promoted to Global Director': TrendingUp,
  '100% Remote Interview': Users
};

const translations = {
  en: {
    title: 'Success Cases',
    subtitle: 'Leaders who transformed their careers through strategic English mastery'
  },
  es: {
    title: 'Casos de Éxito',
    subtitle: 'Líderes que transformaron sus carreras mediante el dominio estratégico del inglés'
  }
};

export const TestimonialsSection = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <section id="results" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,5vw,3.75rem)] font-bold mb-4 text-heading">
            {t.title}
          </h2>
          <p className="text-[clamp(1rem,2vw,1.25rem)] text-foreground">
            {t.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockTestimonials.map((testimonial) => {
            const AchievementIcon = achievementIcons[testimonial.featured as keyof typeof achievementIcons] || TrendingUp;
            return (
              <Card key={testimonial.id} className="p-8 hover-lift bg-primary-light border-border shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-heading">{testimonial.name}</h3>
                    <p className="text-sm text-foreground">{testimonial.role}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <span>📍</span> {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="text-foreground mb-6 italic leading-relaxed">
                  {testimonial.content}
                </p>
                <div className="pt-4 border-t border-border flex items-center gap-2">
                  <AchievementIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    {testimonial.featured}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
