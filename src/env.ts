// Entorno mínimo para configuración de Auth0 / OAuth
// Actualiza estos valores según tu tenant de Auth0 (o Okta si aplica)
export const ENV = {
  okta_domain: 'iph.us.auth0.com',
  okta_clientId: 'vaZPBZBPDa793Q1BARgrNuw4SDFBV9Oz',
  okta_audience: 'https://www.iph-api.net',
  okta_scope: 'read:current_user profile offline_access',
};

// Nota: puedes reemplazar por import.meta.env.VITE_* si prefieres variables de Vite
