import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import lexoRobot from '@/assets/lexo-robot.svg';

export const LexoSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-16 text-white">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                {t('lexo.title')}
              </h2>
              
              <p className="text-base sm:text-lg lg:text-xl opacity-95 font-normal leading-relaxed">
                {t('lexo.description')}
              </p>
              
              <div className="flex items-center gap-3 sm:gap-4 bg-white/15 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base lg:text-lg text-white">{t('lexo.support.title')}</p>
                  <p className="text-xs sm:text-sm lg:text-base text-white/90">{t('lexo.support.subtitle')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end mt-6 lg:mt-0">
              <div className="relative">
                <img 
                  src={lexoRobot}
                  alt="Lexo AI Digital Mentor"
                  className="w-64 sm:w-72 lg:w-80 xl:w-96 h-auto object-cover rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
