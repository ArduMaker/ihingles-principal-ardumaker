// Vamos a ahcer una pagina de /dhasboard_login que redirija a /dashboard una vez Auth0 haya cargado

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Cookies from 'js-cookie';

const DashboardLogin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth0();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
        setTimeout( ()=> {navigate('/panel', { replace: true });}, 300); // Pequeño retraso para asegurar que la cookie se ha establecido)
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Mientras tanto, mostramos un mensaje de carga (Coloca una animación de carga aquí)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="loader mb-4"></div> {/* Aquí puedes poner una animación de carga */}
        <p className="text-lg font-medium">Cargando tu panel de control...</p>
      </div>
    </div>
  );
};

export default DashboardLogin;
