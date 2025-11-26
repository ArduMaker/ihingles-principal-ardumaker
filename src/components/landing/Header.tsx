import { Button } from '@/components/ui/button';
import { useAuth0 } from '@auth0/auth0-react';
import { GraduationCap, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo.svg';
import { useParams, useNavigate } from 'react-router-dom';

export const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const handleStart = () => {
    if (!isAuthenticated) return loginWithRedirect();
    navigate('/dashboard');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <img src={logo} alt="Shield" className="w-5 h-5 sm:w-6 sm:h-6 brightness-0 invert" />
          </div>
          <span className="font-bold text-base sm:text-lg lg:text-xl">IH Ingles Academy</span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          <a href="#method" className="text-sm xl:text-base hover:text-primary transition-colors font-medium">{t('nav.method')}</a>
          <a href="#results" className="text-sm xl:text-base hover:text-primary transition-colors font-medium">{t('nav.results')}</a>
          <a href="#community" className="text-sm xl:text-base hover:text-primary transition-colors font-medium">{t('nav.community')}</a>
        </nav>
        
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium uppercase">{language}</span>
          </button>
          <Button className="font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 h-auto" onClick={handleStart}>
            {t('nav.start')}
          </Button>
        </div>
      </div>
    </header>
  );
};
