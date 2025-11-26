import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Routes>
            <Route path="/" element={<Dashboard />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
