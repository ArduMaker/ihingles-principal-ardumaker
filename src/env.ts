// Entorno mínimo para configuración de Auth0 / OAuth
// Actualiza estos valores según tu tenant de Auth0 (o Okta si aplica)
const envProd = {
  okta_domain: 'iph.us.auth0.com',
  okta_clientId: 'vaZPBZBPDa793Q1BARgrNuw4SDFBV9Oz',
  okta_audience: 'https://www.iph-api.net',
  okta_scope: 'read:current_user profile offline_access',
};

const envLocal = {
  okta_domain: "dev-1f1c60qnpfuxkaxx.us.auth0.com",
  okta_clientId: "l3p9XLllnNArx62lrFqJRj48750mCYsY",
  okta_audience: "https://www.iph-api.net",
  okta_scope: "read:current_user profile offline_access",
};

export const ENV = envProd;

// Nota: puedes reemplazar por import.meta.env.VITE_* si prefieres variables de Vite
