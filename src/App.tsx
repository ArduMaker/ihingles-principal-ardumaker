import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Terms from "./pages/Terms";
import Dashboard from "./pages/Dashboard";
import Unidades from "./pages/Unidades";
import Biblioteca from "./pages/Biblioteca";
import Vocabulario from "./pages/Vocabulario";
import Progreso from "./pages/Progreso";
import Facturacion from "./pages/Facturacion";
import Pago from "./pages/Pago";
import Perfil from "./pages/Perfil";
import Modulo from "./pages/Modulo";
import Unidad from "./pages/Unidad";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Redirige a /dashboard después del callback de Auth0 si aplica */}
          <AuthRedirector />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/unidades" element={<Unidades />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/vocabulario" element={<Vocabulario />} />
            <Route path="/progreso" element={<Progreso />} />
            <Route path="/facturacion" element={<Facturacion />} />
            <Route path="/facturacion/pago/:planId" element={<Pago />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/modulo/:id" element={<Modulo />} />
            <Route path="/unidad/:levelId" element={<Unidad />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

// Component placed inside <BrowserRouter> to handle post-login redirect behavior.
function AuthRedirector() {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      const returnTo = detail?.returnTo;
      if (returnTo) {
        if (typeof returnTo === 'string' && returnTo.startsWith('http')) {
          window.location.replace(returnTo);
        } else {
          navigate(returnTo || '/dashboard', { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    };

    window.addEventListener('auth:redirect', handler as EventListener);
    return () => window.removeEventListener('auth:redirect', handler as EventListener);
  }, [navigate]);

  return null;
}
