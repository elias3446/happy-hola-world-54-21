
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractiveCharts } from './InteractiveCharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

interface ReporteComparativo {
  id: string;
  titulo: string;
  estado: string;
  categoria: string;
  prioridad: string;
  fechaCreacion: string;
  activo: boolean;
}

interface MultiReportComparisonProps {
  reportesSeleccionados: ReporteComparativo[];
}

export const MultiReportComparison: React.FC<MultiReportComparisonProps> = ({
  reportesSeleccionados
}) => {
  if (reportesSeleccionados.length === 0) {
    return null;
  }

  // Agrupar datos por categorías para comparación
  const comparisonData = {
    estados: reportesSeleccionados.reduce((acc, reporte) => {
      const existing = acc.find(item => item.name === reporte.estado);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ 
          name: reporte.estado, 
          value: 1, 
          color: getColorForEstado(reporte.estado),
          trend: Math.random() * 10 - 5
        });
      }
      return acc;
    }, [] as { name: string; value: number; color: string; trend: number }[]),
    
    categorias: reportesSeleccionados.reduce((acc, reporte) => {
      const existing = acc.find(item => item.name === reporte.categoria);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ 
          name: reporte.categoria, 
          value: 1, 
          color: getColorForCategoria(reporte.categoria),
          trend: Math.random() * 10 - 5
        });
      }
      return acc;
    }, [] as { name: string; value: number; color: string; trend: number }[]),
    
    prioridades: reportesSeleccionados.reduce((acc, reporte) => {
      const existing = acc.find(item => item.name === reporte.prioridad);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ 
          name: reporte.prioridad, 
          value: 1, 
          color: getColorForPrioridad(reporte.prioridad),
          trend: Math.random() * 10 - 5
        });
      }
      return acc;
    }, [] as { name: string; value: number; color: string; trend: number }[])
  };

  const reportesActivos = reportesSeleccionados.filter(r => r.activo).length;
  const porcentajeActivos = Math.round((reportesActivos / reportesSeleccionados.length) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Comparativa de Reportes Seleccionados
          </CardTitle>
          <CardDescription>
            Análisis comparativo de {reportesSeleccionados.length} reportes seleccionados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{reportesSeleccionados.length}</div>
              <div className="text-sm text-muted-foreground">Total Reportes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{reportesActivos}</div>
              <div className="text-sm text-muted-foreground">Reportes Activos</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{porcentajeActivos}%</div>
              <div className="text-sm text-muted-foreground">Tasa de Actividad</div>
            </div>
          </div>

          {/* Lista de reportes seleccionados */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Reportes en comparación:</h4>
            {reportesSeleccionados.map((reporte, index) => (
              <div key={reporte.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{reporte.titulo}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(reporte.fechaCreacion).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {reporte.categoria}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {reporte.estado}
                  </span>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    {reporte.prioridad}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos comparativos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InteractiveCharts
          title="Estados en Comparación"
          description="Distribución de estados en los reportes seleccionados"
          data={comparisonData.estados}
          showTrends={true}
        />
        
        <InteractiveCharts
          title="Categorías en Comparación"
          description="Distribución de categorías en los reportes seleccionados"
          data={comparisonData.categorias}
          showTrends={true}
        />
        
        <InteractiveCharts
          title="Prioridades en Comparación"
          description="Distribución de prioridades en los reportes seleccionados"
          data={comparisonData.prioridades}
          showTrends={true}
        />
      </div>
    </div>
  );
};

// Funciones auxiliares para colores
function getColorForEstado(estado: string): string {
  const colors: { [key: string]: string } = {
    'pendiente': '#EF4444',
    'en_proceso': '#F59E0B',
    'completado': '#10B981',
    'cancelado': '#6B7280'
  };
  return colors[estado.toLowerCase()] || '#6B7280';
}

function getColorForCategoria(categoria: string): string {
  const colors: { [key: string]: string } = {
    'infraestructura': '#3B82F6',
    'seguridad': '#EF4444',
    'servicios': '#10B981',
    'ambiente': '#F59E0B'
  };
  return colors[categoria.toLowerCase()] || '#6B7280';
}

function getColorForPrioridad(prioridad: string): string {
  const colors: { [key: string]: string } = {
    'urgente': '#DC2626',
    'alto': '#EA580C',
    'medio': '#D97706',
    'bajo': '#059669'
  };
  return colors[prioridad.toLowerCase()] || '#6B7280';
}
