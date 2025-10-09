import { User, AuthResponse } from '@/types/auth';

export const mockUser: User = {
  id: '1',
  name: 'Alberto González',
  email: 'alberto@valles.com',
  subtitle: 'Level Maestro del Río de la Escritura',
};

export const mockAuthCheck = async (): Promise<AuthResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    user: mockUser
  };
};

export const mockLogin = async (email: string, password: string): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (email && password) {
    return {
      success: true,
      user: mockUser
    };
  }
  
  return {
    success: false,
    message: 'Credenciales inválidas'
  };
};
