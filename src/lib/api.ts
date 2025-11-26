// API configuration and utilities

export const API_BASE_URL = 'https://www.iph-api.net';

//export const API_BASE_URL = 'https://oxibackihingles.carlos.arducloud.com';

export const AUTH_COOKIE_NAME = 'Autenticacion';

// Get auth cookie from document.cookie
export const getAuthCookie = (): string | null => {
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`));
  return authCookie ? authCookie.split('=')[1] : null;
};


// Cache para consultas en menos de 2 segundos, si es el mismo enpoint en ese tiempo, devolver el mismo resultado
const CACHE : { [key: string]: [number, any] } = {};


// Generic API call function
export async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  if (CACHE[endpoint] && (Date.now() - CACHE[endpoint][0] < 2000) && CACHE[endpoint][1] != null) {
    return CACHE[endpoint][1];
  }

  CACHE[endpoint] = [Date.now(), null];
  const authToken = getAuthCookie();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    // Añadimos el header Authorization con el formato Bearer para que coincida
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403 || response.status === 409) {
        window.location.href = '/';
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error('No se pudo completar la operación. Intenta nuevamente.');
    }

    const clone = response.clone();

    try{
      const jsonResponse = await response.json();
      CACHE[endpoint][1] = jsonResponse;
      return jsonResponse;
    }
    catch(error){
      const rawBody = await clone.text();
      return rawBody as unknown as T;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Ocurrió un error inesperado. Intenta nuevamente.');
  }
}

// Statistics endpoints
export const postUserPosition = async (payload: { unidad?: number; position?: number }) => {
  return await api('/statistics/position', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const postUserGrade = async (exerciseId: string, grade: number, unit: string) => {
  const payload = btoa(JSON.stringify({ exerciseId, grade, unit }));
  return await api('/statistics/user-grade', {
    method: 'POST',
    body: JSON.stringify({ payload }),
  });
};

// Vocabulary endpoints
export interface VocabularyItem {
  vocabularyType: string;
  vocabularyLevel: string;
  title: string;
  explanation: string;
  example: string;
}

export interface VocabularyResponse {
  data: VocabularyItem[];
  count: number;
  page: string;
}

export const getVocabulary = async (searchQuery?: string, page: number = 1): Promise<VocabularyResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    ...(searchQuery && { search: searchQuery }),
  });
  
  return await api(`/vocabulary/from-jsons?${params.toString()}`, {
    method: 'GET',
  });
};
