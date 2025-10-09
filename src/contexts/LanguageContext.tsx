import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.method': 'Method',
    'nav.results': 'Success Cases',
    'nav.community': 'Community',
    'nav.start': 'Start Transformation',
    'hero.title': "The only method that doesn't just teach you English",
    'hero.subtitle': 'It teaches you to own it with pride.',
    'hero.description': 'For ambitious Latin American professionals who demand real results. Strategic, gamified, and designed for leaders who embrace their heritage while mastering global communication.',
    'hero.cta.primary': 'Begin Your Journey',
    'hero.cta.secondary': 'Watch Method Overview',
    'hero.badge.title': 'Duke Level Achieved',
    'hero.badge.subtitle': 'Advanced Conversational Mastery',
    'method.title': 'The Kingdom of Words Method',
    'method.description': 'A strategic, gamified approach that transforms how Latin American professionals master English while honoring their cultural identity.',
    'method.card1.title': 'Strategic Progression',
    'method.card1.description': 'Advance through noble ranks: Squire → Knight → Lord → Viscount → Earl → Duke. Each level unlocks new communication powers.',
    'method.card1.badge': 'Measurable Milestones',
    'method.card2.title': 'Real Conversation Focus',
    'method.card2.description': "Skip textbook theory. Master practical English through scenarios you'll actually face in business and leadership.",
    'method.card2.badge': 'Immediate Application',
    'method.card3.title': 'Accent Pride',
    'method.card3.description': 'Your Latin heritage is your strength. We refine your English while celebrating your authentic voice.',
    'method.card3.badge': 'Cultural Honor',
    'lexo.title': 'Meet Lexo, Your Digital Mentor',
    'lexo.description': 'Your AI companion guides you through quests, celebrates victories, and ensures you never lose momentum in your English mastery journey.',
    'lexo.support.title': '24/7 Support',
    'lexo.support.subtitle': 'Always available guidance',
  },
  es: {
    'nav.method': 'Método',
    'nav.results': 'Casos de Éxito',
    'nav.community': 'Comunidad',
    'nav.start': 'Comenzar Transformación',
    'hero.title': 'El único método que no solo te enseña inglés',
    'hero.subtitle': 'Te enseña a dominarlo con orgullo.',
    'hero.description': 'Para profesionales latinoamericanos ambiciosos que exigen resultados reales. Estratégico, gamificado y diseñado para líderes que abrazan su herencia mientras dominan la comunicación global.',
    'hero.cta.primary': 'Comienza Tu Viaje',
    'hero.cta.secondary': 'Ver Descripción del Método',
    'hero.badge.title': 'Nivel Duke Alcanzado',
    'hero.badge.subtitle': 'Dominio Conversacional Avanzado',
    'method.title': 'El Método Kingdom of Words',
    'method.description': 'Un enfoque estratégico y gamificado que transforma cómo los profesionales latinoamericanos dominan el inglés mientras honran su identidad cultural.',
    'method.card1.title': 'Progresión Estratégica',
    'method.card1.description': 'Avanza a través de rangos nobles: Escudero → Caballero → Lord → Vizconde → Conde → Duque. Cada nivel desbloquea nuevos poderes de comunicación.',
    'method.card1.badge': 'Hitos Medibles',
    'method.card2.title': 'Enfoque en Conversación Real',
    'method.card2.description': 'Olvida la teoría de los libros de texto. Domina el inglés práctico a través de escenarios que enfrentarás en negocios y liderazgo.',
    'method.card2.badge': 'Aplicación Inmediata',
    'method.card3.title': 'Orgullo de Acento',
    'method.card3.description': 'Tu herencia latina es tu fortaleza. Refinamos tu inglés mientras celebramos tu voz auténtica.',
    'method.card3.badge': 'Honor Cultural',
    'lexo.title': 'Conoce a Lexo, Tu Mentor Digital',
    'lexo.description': 'Tu compañero de IA te guía a través de misiones, celebra victorias y asegura que nunca pierdas impulso en tu viaje de dominio del inglés.',
    'lexo.support.title': 'Soporte 24/7',
    'lexo.support.subtitle': 'Orientación siempre disponible',
  }
};
