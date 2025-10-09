import { Button } from '@/components/ui/button';
import { GraduationCap, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import shieldIcon from '@/assets/icons/shield.svg';
import logo from '@/assets/logo.svg';

export const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <img src={logo} alt="Shield" className="w-6 h-6 brightness-0 invert" />
          </div>
          <span className="font-bold text-xl">Valle's Systems</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#method" className="text-base hover:text-primary transition-colors font-medium">{t('nav.method')}</a>
          <a href="#results" className="text-base hover:text-primary transition-colors font-medium">{t('nav.results')}</a>
          <a href="#community" className="text-base hover:text-primary transition-colors font-medium">{t('nav.community')}</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="w-5 h-5" />
            <span className="text-sm font-medium uppercase">{language}</span>
          </button>
          <Button className="font-semibold" asChild>
            <Link to="/dashboard">{t('nav.start')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
