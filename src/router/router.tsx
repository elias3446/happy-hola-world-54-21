
import { createBrowserRouter } from 'react-router-dom';
import { ReporteDetalle } from '@/pages/ReporteDetalle';
import { ReportesPublicos } from '@/pages/ReportesPublicos';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ReportesPublicos />,
  },
  {
    path: '/reportes-publicos',
    element: <ReportesPublicos />,
  },
  {
    path: '/reporte/:id',
    element: <ReporteDetalle />,
  },
]);
