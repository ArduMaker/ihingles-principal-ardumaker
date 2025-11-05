import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import Cookies from 'js-cookie';
import { get_user_profile } from '@/data/profile';

export const AUTH_COOKIE_NAME = 'Autenticacion';
const USER_PROFILE_COOKIE = 'UserProfile';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = Cookies.get(USER_PROFILE_COOKIE);
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    let authCookie = Cookies.get(AUTH_COOKIE_NAME);
    
    // DESARROLLO: Auto-crear cookie si no existe (remover en producción)
    if (!authCookie && import.meta.env.DEV) {
      authCookie = 'mock-auth-token';
      Cookies.set(AUTH_COOKIE_NAME, authCookie, { expires: 7 });
    }
    
    if (authCookie) {
      const cachedProfile = Cookies.get(USER_PROFILE_COOKIE);
      
      if (cachedProfile) {
        setUser(JSON.parse(cachedProfile));
        setIsLoading(false);
      } else {
        const profile = await get_user_profile('1');
        if (profile) {
          setUser(profile);
          Cookies.set(USER_PROFILE_COOKIE, JSON.stringify(profile), { expires: 7 });
        }
        setIsLoading(false);
      }
    } else {
      setUser(null);
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove(AUTH_COOKIE_NAME);
    Cookies.remove(USER_PROFILE_COOKIE);
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
