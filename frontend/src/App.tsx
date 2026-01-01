import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "@/components/login/LoginPage";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Parcelas from "@/pages/Parcelas";
import Siembras from "@/pages/Siembras";
import Cosechas from "@/pages/Cosechas";
import Trabajadores from "@/pages/Trabajadores";
import Tareas from "@/pages/Tareas";
import Sensores from "@/pages/Sensores";
import Recomendaciones from "@/pages/Recomendaciones";
import Insumos from "@/pages/Insumos";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/parcelas" element={<Parcelas />} />
              <Route path="/siembras" element={<Siembras />} />
              <Route path="/cosechas" element={<Cosechas />} />
              <Route path="/trabajadores" element={<Trabajadores />} />
              <Route path="/tareas" element={<Tareas />} />
              <Route path="/sensores" element={<Sensores />} />
              <Route path="/recomendaciones" element={<Recomendaciones />} />
              <Route path="/insumos" element={<Insumos />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
