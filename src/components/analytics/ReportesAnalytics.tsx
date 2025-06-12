
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PieChartCard } from '@/components/dashboard/PieChartCard';

const priorityConfig = {
  urgente: { color: '#DC2626', label: 'Urgente' },
  alto: { color: '#EA580C', label: 'Alto' },
  medio: { color: '#D97706', label: 'Medio' },
  bajo: { color: '#059669', label: 'Bajo' },
};

export const ReportesAnalytics = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center">
        <p className="text-destructive">Error al cargar las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Análisis de Reportes
        </h2>
        <p className="text-muted-foreground">
          Estadísticas detalladas sobre los reportes del sistema
        </p>
      </div>

      {/* Estadísticas de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Reportes"
          value={stats.reportes.total}
          subtitle={`${stats.reportes.activos} activos`}
          icon={FileText}
          color="text-blue-600"
        />
        
        <StatsCard
          title="Reportes Activos"
          value={stats.reportes.activos}
          subtitle={`${Math.round((stats.reportes.activos / stats.reportes.total) * 100)}% del total`}
          icon={TrendingUp}
          color="text-green-600"
        />
        
        <StatsCard
          title="Reportes Recientes"
          value={stats.reportes.recientes}
          subtitle="Últimos 7 días"
          icon={Activity}
          color="text-orange-600"
        />
        
        <StatsCard
          title="Por Estado"
          value={stats.reportes.porEstado.length}
          subtitle="Estados diferentes"
          icon={FileText}
          color="text-purple-600"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartCard
          title="Distribución por Estado"
          description="Reportes clasificados según su estado actual"
          data={stats.reportes.porEstado.map(item => ({
            name: item.estado,
            value: item.count,
            color: item.color
          }))}
        />
        
        <PieChartCard
          title="Distribución por Categoría"
          description="Reportes clasificados según su categoría"
          data={stats.reportes.porCategoria.map(item => ({
            name: item.categoria,
            value: item.count,
            color: item.color
          }))}
        />
      </div>

      {/* Gráfico de Prioridades */}
      {stats.reportes.porPrioridad && stats.reportes.porPrioridad.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartCard
            title="Distribución por Prioridad"
            description="Reportes clasificados según su nivel de prioridad"
            data={stats.reportes.porPrioridad.map(item => ({
              name: priorityConfig[item.priority as keyof typeof priorityConfig]?.label || item.priority,
              value: item.count,
              color: priorityConfig[item.priority as keyof typeof priorityConfig]?.color || '#6B7280'
            }))}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Estadísticas de Prioridad
              </CardTitle>
              <CardDescription>
                Desglose detallado de reportes por nivel de prioridad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.reportes.porPrioridad.map((item) => (
                  <div key={item.priority} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ 
                          backgroundColor: priorityConfig[item.priority as keyof typeof priorityConfig]?.color || '#6B7280' 
                        }}
                      />
                      <span className="font-medium">
                        {priorityConfig[item.priority as keyof typeof priorityConfig]?.label || item.priority}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((item.count / stats.reportes.total) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
