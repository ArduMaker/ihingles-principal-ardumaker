import { UserProfile } from '@/types/auth';

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

export const get_user_profile = async (userId: string): Promise<UserProfile> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockUserProfile;
};
