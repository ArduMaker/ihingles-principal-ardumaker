import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import Cookies from 'js-cookie';

export const AUTH_COOKIE_NAME = 'Autenticacion';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    let authCookie = Cookies.get(AUTH_COOKIE_NAME);
    
    // DESARROLLO: Auto-crear cookie si no existe (remover en producción)
    if (!authCookie && import.meta.env.DEV) {
      authCookie = 'mock-auth-token';
      Cookies.set(AUTH_COOKIE_NAME, authCookie, { expires: 7 });
    }
    
    if (authCookie) {
      // Mock user data - replace with real API call
      const mockUser: User = {
        id: '1',
        name: 'Alberto González',
        email: 'alberto@example.com',
        subtitle: 'Level Maestro del Río de la Escritura'
      };
      setUser(mockUser);
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    Cookies.remove(AUTH_COOKIE_NAME);
    setUser(null);
    window.location.href = '/';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    checkAuth
  };
};
