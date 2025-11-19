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
      authCookie = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InY5aU5QWk9MWUMwcUdyV2VmRW9DdyJ9.eyJzZXNzaW9uX2lkIjoiNjIuNDguMTg1LjEwIiwiaXNzIjoiaHR0cHM6Ly9pcGgudXMuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTExMzI2NzY0ODU2OTEyMDk1NTY0IiwiYXVkIjpbImh0dHBzOi8vd3d3LmlwaC1hcGkubmV0IiwiaHR0cHM6Ly9pcGgudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTc2MzU1NDgwMSwiZXhwIjoxNzYzNjQxMjAxLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIG9mZmxpbmVfYWNjZXNzIiwiYXpwIjoidmFaUEJaQlBEYTc5M1ExQkFSZ3JOdXc0U0RGQlY5T3oifQ.SKa_8i4gS5aX8LtoukDSlCTNGZewrV5uekhUsCnqeCMnAz8-EA4DsrH5BLTA06AnuKVSQrUE7yjO69FWM8ziXlgQd6GXKROwfgeQ4-GZu2OEocmzqs9WaAEgbtyVwYMeS--txbRLsaKU0ZEbV4nQ6yC8ADlYEy4yKifn0ColXE_kQRGpMu0MMvF0LBgEnAgZYhlfIAHBD-fH-UedJuvTVGRHVbSBMg-PaPCx31Z4B0exDfuELbmQG89Ioc6VWW_1LM_VGwTdFqKPasVl56WtT6MgItQJE7N6Qi9IcdFp6O3XtEhcHazHdhothezDlp2QwuIfYodtxqQtW6Z95ZJIMA';
      Cookies.set(AUTH_COOKIE_NAME, authCookie, { expires: 7 });
    }
    
    // Si no hay cookie de autenticación, redirigimos a /login
    if (!authCookie) {
      setUser(null);
      setIsLoading(false);
      // Evitar redireccionar si ya estamos en la página de login
      if (window.location.pathname !== '/') window.location.href = '/';
      return;
    }

    if (authCookie) {
      const cachedProfile = null
      
      if (cachedProfile) {
        setUser(JSON.parse(cachedProfile));
        setIsLoading(false);
      } else {
        const profile = await get_user_profile();
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
