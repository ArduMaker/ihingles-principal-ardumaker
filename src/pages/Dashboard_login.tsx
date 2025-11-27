// Vamos a ahcer una pagina de /dhasboard_login que redirija a /dashboard una vez Auth0 haya cargado

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Cookies from 'js-cookie';
import { AUTH_COOKIE_NAME } from '@/lib/api';

const DashboardLogin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
        // solo pregunto 10 veces y si no mando a loginWithRedirect
        const authCookie = Cookies.get(AUTH_COOKIE_NAME);
        if (!authCookie) {
            let attempts = 0;
            const interval = setInterval(() => {
                const checkCookie = Cookies.get(AUTH_COOKIE_NAME);
                attempts++;
                if (attempts >= 10) {
                    clearInterval(interval);
                    loginWithRedirect();
                }
                if (checkCookie) {
                    clearInterval(interval);
                    navigate('/panel', { replace: true });
                }
            }, 100);
        } else {
            navigate('/panel', { replace: true });
        }
    }
    if (!isLoading && !isAuthenticated) {
        loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Mientras tanto, mostramos un mensaje de carga (Coloca una animación de carga aquí)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="loader mb-4"></div> {/* Aquí puedes poner una animación de carga */}
        <p className="text-lg font-medium">Cargando tu panel...</p>
      </div>
    </div>
  );
};

export default DashboardLogin;
