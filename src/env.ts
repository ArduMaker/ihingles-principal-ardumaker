// Entorno mínimo para configuración de Auth0 / OAuth y Stripe
// Actualiza estos valores según tu tenant de Auth0 (o Okta si aplica)
const envProd = {
  okta_domain: 'iph.us.auth0.com',
  okta_clientId: 'vaZPBZBPDa793Q1BARgrNuw4SDFBV9Oz',
  okta_audience: 'https://www.iph-api.net',
  okta_scope: 'read:current_user profile offline_access',
  stripe_public_key: 'pk_live_51HlGT1JKrBsDG5z0a4qDGwQQvl9VlEQxMqVQtKSQGqE3wC3qGvB7Tj6V1qW8tZ2x3yL9mZ5nK1pJ2hF4gD6wR8sI00bC2gH3qJ',
  server: 'https://www.iph-api.net',
};

const envLocal = {
  okta_domain: "dev-1f1c60qnpfuxkaxx.us.auth0.com",
  okta_clientId: "l3p9XLllnNArx62lrFqJRj48750mCYsY",
  okta_audience: "https://www.iph-api.net",
  okta_scope: "read:current_user profile offline_access",
  stripe_public_key: 'pk_test_51HlGT1JKrBsDG5z0a4qDGwQQvl9VlEQxMqVQtKSQGqE3wC3qGvB7Tj6V1qW8tZ2x3yL9mZ5nK1pJ2hF4gD6wR8sI00bC2gH3qJ',
  server: 'https://www.iph-api.net',
};

export const ENV = envProd;

// Nota: puedes reemplazar por import.meta.env.VITE_* si prefieres variables de Vite
