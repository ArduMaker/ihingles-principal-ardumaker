import { UserProfile } from '@/types/auth';
import { api } from '@/lib/api';

export const mockUserProfile: UserProfile = {
  id: '1',
  name: 'Alberto González',
  email: 'Alberto_G@gmail.com',
  phone: '+34 678 986 097',
  country: 'España',
  city: 'Madrid',
  subtitle: 'Level Maestro del Río de la Escritura',
  skills: [
    { skill: 'Grammar', value: 75 },
    { skill: 'Listening', value: 65 },
    { skill: 'Pronunciation', value: 55 },
    { skill: 'Reading', value: 70 },
    { skill: 'Speaking', value: 50 },
    { skill: 'Writing', value: 60 },
  ],
  unitsCompleted: 4,
  totalUnits: 69,
  consecutiveDays: 15,
};

// Llama al endpoint real /users/own y hace parsing compatible con el front viejo.
export const get_user_profile = async (): Promise<UserProfile> => {
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
    console.error('Error obteniendo perfil de usuario, usando mock:', e);
    return mockUserProfile;
  }
};
