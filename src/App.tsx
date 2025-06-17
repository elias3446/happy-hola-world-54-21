
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import Index from '@/pages/Index';
import Home from '@/pages/Home';
import { Dashboard } from '@/components/Dashboard';
import NuevoReporte from '@/pages/NuevoReporte';
import ReporteDetalle from '@/pages/ReporteDetalle';
import ReportesPublicos from '@/pages/ReportesPublicos';
import MapaReportes from '@/pages/MapaReportes';
import MiPerfil from '@/pages/MiPerfil';
import AsistenteVirtual from '@/pages/AsistenteVirtual';
import NotFound from '@/pages/NotFound';

// Admin pages
import AdminUsuarios from '@/pages/admin/AdminUsuarios';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminCategorias from '@/pages/admin/AdminCategorias';
import AdminEstados from '@/pages/admin/AdminEstados';
import AdminReportes from '@/pages/admin/AdminReportes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/nuevo-reporte" element={<NuevoReporte />} />
            <Route path="/reportes/:id" element={<ReporteDetalle />} />
            <Route path="/reportes-publicos" element={<ReportesPublicos />} />
            <Route path="/mapa-reportes" element={<MapaReportes />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />
            <Route path="/asistente" element={<AsistenteVirtual />} />
            
            {/* Admin routes */}
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/categorias" element={<AdminCategorias />} />
            <Route path="/admin/estados" element={<AdminEstados />} />
            <Route path="/admin/reportes" element={<AdminReportes />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
