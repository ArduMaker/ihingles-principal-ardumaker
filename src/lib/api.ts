// API configuration and utilities

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.vallesystems.com';

export const AUTH_COOKIE_NAME = 'Autenticacion';

// Get auth cookie from document.cookie
export const getAuthCookie = (): string | null => {
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`));
  return authCookie ? authCookie.split('=')[1] : null;
};

// Generic API call function
export async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authToken = getAuthCookie();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers[AUTH_COOKIE_NAME] = authToken;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error('No se pudo completar la operación. Intenta nuevamente.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Ocurrió un error inesperado. Intenta nuevamente.');
  }
}
