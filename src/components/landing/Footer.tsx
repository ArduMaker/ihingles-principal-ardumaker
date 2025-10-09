import { GraduationCap, Mail, Linkedin, Twitter, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const translations = {
  en: {
    about: 'About Valle\'s Systems',
    description: 'Master Essential Codes: Syntax - English - Level - Business - Latin - SMB. Transform your career with strategic English mastery.',
    quickLinks: 'Quick Links',
    home: 'Home',
    method: 'Our Method',
    community: 'Community',
    contact: 'Contact Us',
    legal: 'Legal',
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    followUs: 'Follow Us',
    rights: 'All rights reserved.'
  },
  es: {
    about: 'Acerca de Valle\'s Systems',
    description: 'Domina los Códigos Esenciales: Sintaxis - Inglés - Nivel - Negocios - Latino - SMB. Transforma tu carrera con el dominio estratégico del inglés.',
    quickLinks: 'Enlaces Rápidos',
    home: 'Inicio',
    method: 'Nuestro Método',
    community: 'Comunidad',
    contact: 'Contáctanos',
    legal: 'Legal',
    privacy: 'Política de Privacidad',
    terms: 'Términos y Condiciones',
    followUs: 'Síguenos',
    rights: 'Todos los derechos reservados.'
  }
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <footer className="bg-[#1a1a1a] text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Valle's Systems</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t.description}
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">{t.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  {t.home}
                </a>
              </li>
              <li>
                <a href="#method" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  {t.method}
                </a>
              </li>
              <li>
                <a href="#community" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  {t.community}
                </a>
              </li>
              <li>
                <a href="mailto:contact@vallessystems.com" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  {t.contact}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">{t.legal}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  {t.privacy}
                </a>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-300 hover:text-primary transition-colors">
                  {t.terms}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">{t.followUs}</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="mailto:contact@vallessystems.com" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Mail className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/20 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} Valle's Systems. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};
