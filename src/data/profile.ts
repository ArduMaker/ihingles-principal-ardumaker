import { UserProfile } from '@/types/auth';
import { api, AUTH_COOKIE_NAME, USER_PROFILE_COOKIE } from '@/lib/api';
import Cookies from 'js-cookie';

// Llama al endpoint real /users/own y hace parsing compatible con el front viejo.
export const get_user_profile = async (): Promise<UserProfile> => {
  const userProfileCookie = Cookies.get(USER_PROFILE_COOKIE);
  if (userProfileCookie) {
    return JSON.parse(userProfileCookie) as UserProfile;
  }

  try {
    const res = await api<any>('/users/own', { method: 'GET' });

    // El backend del front viejo devolvía un objeto con { data: "<base64>" }
    // o directamente una cadena. Normalizamos:
    let payload: any = res;
    if (res && typeof res === 'object' && 'data' in res) payload = res.data;
    
    let user: any = null;
    if (typeof payload === 'string') {
      // Intentamos decodificar base64 -> JSON
      try {
        user = JSON.parse(atob(payload));
        
      } catch (e) {
        // Si no es base64, intentamos parsear como JSON plano
        try {
          user = JSON.parse(payload);
        } catch (e) {
          // No JSON: devolvemos la cadena tal cual
          user = payload;
        }
      }
    } else if (typeof payload === 'object') {
      user = payload;
    } else {
      user = payload;
    }

    return user as UserProfile;
  } catch (e) {
    return null;
  }
};
