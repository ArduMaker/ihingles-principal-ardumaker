import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import lexoRobot from '@/assets/lexo-robot.svg';

export const LexoSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-primary rounded-3xl p-8 lg:p-16 text-white">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8">
              <h2 className="text-3xl lg:text-5xl font-bold">
                {t('lexo.title')}
              </h2>
              
              <p className="text-lg lg:text-xl opacity-95 font-normal leading-relaxed">
                {t('lexo.description')}
              </p>
              
              <div className="flex items-center gap-4 bg-white/15 rounded-xl p-4 lg:p-5">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-base lg:text-lg text-white">{t('lexo.support.title')}</p>
                  <p className="text-sm lg:text-base text-white/90">{t('lexo.support.subtitle')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img 
                  src={lexoRobot}
                  alt="Lexo AI Digital Mentor"
                  className="w-72 h-auto lg:w-96 object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
