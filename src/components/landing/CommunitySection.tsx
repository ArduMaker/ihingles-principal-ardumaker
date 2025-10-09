import { Card } from '@/components/ui/card';
import { Users, Video, Award } from 'lucide-react';
import { mockCommunityBenefits } from '@/data/landing';
import { useLanguage } from '@/contexts/LanguageContext';

const iconMap = {
  users: Users,
  video: Video,
  award: Award,
};

const translations = {
  en: {
    title: 'Join the Elite Community',
    subtitle: 'Connect with ambitious Latin American professionals mastering English together',
    panel: 'Student Progress Panel',
    members: '2,500+ active members advancing their careers'
  },
  es: {
    title: 'Únete a la Comunidad Elite',
    subtitle: 'Conéctate con profesionales latinoamericanos ambiciosos dominando el inglés juntos',
    panel: 'Panel de Progreso Estudiantil',
    members: '2,500+ miembros activos avanzando en sus carreras'
  }
};

export const CommunitySection = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <section id="community" className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(2rem,5vw,3.75rem)] font-bold mb-4 text-primary-foreground">
            {t.title}
          </h2>
          <p className="text-[clamp(1rem,2vw,1.25rem)] text-primary-foreground/90">
            {t.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {mockCommunityBenefits.map((benefit) => {
            const Icon = iconMap[benefit.icon as keyof typeof iconMap];
            return (
              <div key={benefit.id} className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-primary-foreground">{benefit.title}</h3>
                  <p className="text-primary-foreground/90">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <Card className="p-8 bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-2 text-primary-foreground text-center">{t.panel}</h3>
          <p className="text-lg text-primary-foreground/90 text-center">{t.members}</p>
        </Card>
      </div>
    </section>
  );
};
