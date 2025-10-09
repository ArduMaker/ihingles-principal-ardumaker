import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';

const translations = {
  en: {
    title: 'Terms and Conditions',
    lastUpdated: 'Last Updated',
    date: 'January 2025',
    intro: 'Welcome to Valle\'s Systems. By accessing and using our services, you agree to comply with and be bound by the following terms and conditions.',
    sections: [
      {
        title: '1. Acceptance of Terms',
        content: 'By accessing or using Valle\'s Systems platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.'
      },
      {
        title: '2. Services Description',
        content: 'Valle\'s Systems provides an online English learning platform focused on business communication for Latin American professionals. Our services include structured courses, interactive lessons, progress tracking, and community features.'
      },
      {
        title: '3. User Accounts',
        content: 'To access certain features of our platform, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information during registration.'
      },
      {
        title: '4. Payment Terms',
        content: 'Subscription fees are charged in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days notice to active subscribers.'
      },
      {
        title: '5. Intellectual Property',
        content: 'All content, materials, and intellectual property on the Valle\'s Systems platform are owned by or licensed to us. You may not reproduce, distribute, modify, or create derivative works without our express written permission.'
      },
      {
        title: '6. User Conduct',
        content: 'You agree to use our platform only for lawful purposes and in a manner that does not infringe upon the rights of others. Prohibited activities include harassment, uploading malicious code, attempting to gain unauthorized access, or violating any applicable laws.'
      },
      {
        title: '7. Privacy and Data Protection',
        content: 'Your use of Valle\'s Systems is also governed by our Privacy Policy. We collect and process personal data in accordance with applicable data protection laws. Please review our Privacy Policy to understand our practices.'
      },
      {
        title: '8. Limitation of Liability',
        content: 'Valle\'s Systems is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.'
      },
      {
        title: '9. Termination',
        content: 'We reserve the right to suspend or terminate your account if you violate these Terms and Conditions or engage in conduct that we deem inappropriate. Upon termination, your right to access and use the platform will immediately cease.'
      },
      {
        title: '10. Changes to Terms',
        content: 'We may modify these Terms and Conditions at any time. Changes will be effective upon posting to our platform. Your continued use of Valle\'s Systems after changes are posted constitutes your acceptance of the modified terms.'
      },
      {
        title: '11. Governing Law',
        content: 'These Terms and Conditions shall be governed by and construed in accordance with applicable international laws. Any disputes arising from these terms shall be resolved through binding arbitration.'
      },
      {
        title: '12. Contact Information',
        content: 'If you have questions about these Terms and Conditions, please contact us at legal@vallessystems.com.'
      }
    ]
  },
  es: {
    title: 'Términos y Condiciones',
    lastUpdated: 'Última Actualización',
    date: 'Enero 2025',
    intro: 'Bienvenido a Valle\'s Systems. Al acceder y usar nuestros servicios, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones.',
    sections: [
      {
        title: '1. Aceptación de Términos',
        content: 'Al acceder o usar la plataforma de Valle\'s Systems, usted reconoce que ha leído, entendido y acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con estos términos, por favor no use nuestros servicios.'
      },
      {
        title: '2. Descripción de Servicios',
        content: 'Valle\'s Systems proporciona una plataforma de aprendizaje de inglés en línea enfocada en comunicación empresarial para profesionales latinoamericanos. Nuestros servicios incluyen cursos estructurados, lecciones interactivas, seguimiento de progreso y características comunitarias.'
      },
      {
        title: '3. Cuentas de Usuario',
        content: 'Para acceder a ciertas características de nuestra plataforma, debe crear una cuenta. Usted es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades que ocurran bajo su cuenta. Debe proporcionar información precisa y completa durante el registro.'
      },
      {
        title: '4. Términos de Pago',
        content: 'Las tarifas de suscripción se cobran por adelantado de forma mensual o anual. Todas las tarifas no son reembolsables excepto cuando lo requiera la ley. Nos reservamos el derecho de cambiar nuestros precios con 30 días de aviso a los suscriptores activos.'
      },
      {
        title: '5. Propiedad Intelectual',
        content: 'Todo el contenido, materiales y propiedad intelectual en la plataforma Valle\'s Systems son propiedad nuestra o están licenciados para nosotros. No puede reproducir, distribuir, modificar o crear obras derivadas sin nuestro permiso expreso por escrito.'
      },
      {
        title: '6. Conducta del Usuario',
        content: 'Usted acepta usar nuestra plataforma solo para propósitos legales y de una manera que no infrinja los derechos de otros. Las actividades prohibidas incluyen acoso, carga de código malicioso, intento de acceso no autorizado o violación de leyes aplicables.'
      },
      {
        title: '7. Privacidad y Protección de Datos',
        content: 'Su uso de Valle\'s Systems también está regido por nuestra Política de Privacidad. Recopilamos y procesamos datos personales de acuerdo con las leyes aplicables de protección de datos. Por favor revise nuestra Política de Privacidad para entender nuestras prácticas.'
      },
      {
        title: '8. Limitación de Responsabilidad',
        content: 'Valle\'s Systems se proporciona "tal cual" sin garantías de ningún tipo. No seremos responsables de daños indirectos, incidentales, especiales, consecuentes o punitivos que surjan de su uso de nuestros servicios.'
      },
      {
        title: '9. Terminación',
        content: 'Nos reservamos el derecho de suspender o terminar su cuenta si viola estos Términos y Condiciones o se involucra en conductas que consideremos inapropiadas. Al terminar, su derecho de acceso y uso de la plataforma cesará inmediatamente.'
      },
      {
        title: '10. Cambios a los Términos',
        content: 'Podemos modificar estos Términos y Condiciones en cualquier momento. Los cambios serán efectivos al publicarse en nuestra plataforma. Su uso continuo de Valle\'s Systems después de que se publiquen los cambios constituye su aceptación de los términos modificados.'
      },
      {
        title: '11. Ley Aplicable',
        content: 'Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes internacionales aplicables. Cualquier disputa que surja de estos términos se resolverá mediante arbitraje vinculante.'
      },
      {
        title: '12. Información de Contacto',
        content: 'Si tiene preguntas sobre estos Términos y Condiciones, por favor contáctenos en legal@vallessystems.com.'
      }
    ]
  }
};

const Terms = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-bold mb-4 text-heading">
              {t.title}
            </h1>
            <p className="text-muted-foreground">
              {t.lastUpdated}: {t.date}
            </p>
          </div>

          <Card className="p-8 md:p-12 mb-8 bg-card border-border">
            <p className="text-foreground leading-relaxed mb-8">
              {t.intro}
            </p>

            <div className="space-y-8">
              {t.sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-2xl font-bold mb-3 text-heading">
                    {section.title}
                  </h2>
                  <p className="text-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
