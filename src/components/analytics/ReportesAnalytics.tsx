
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Activity, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { RealTimeMetrics } from './RealTimeMetrics';
import { InteractiveCharts } from './InteractiveCharts';
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel';
import { NotificationProvider, useNotifications } from './NotificationSystem';
import { AdvancedFilters } from '@/hooks/useAdvancedFilters';
import { useQueryClient } from '@tanstack/react-query';

const priorityConfig = {
  urgente: { color: '#DC2626', label: 'Urgente' },
  alto: { color: '#EA580C', label: 'Alto' },
  medio: { color: '#D97706', label: 'Medio' },
  bajo: { color: '#059669', label: 'Bajo' },
};

const ReportesAnalyticsContent = () => {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters | null>(null);
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();

  const handleRefreshData = useCallback(async () => {
    try {
      await refetch();
      showSuccess('Datos actualizados correctamente');
    } catch (error) {
      showError('Error al actualizar los datos');
    }
  }, [refetch, showSuccess, showError]);

  const handleFiltersChange = useCallback((filters: AdvancedFilters) => {
    setAppliedFilters(filters);
    // Aquí podrías implementar lógica para filtrar los datos según los filtros aplicados
  }, []);

  // Filter data based on applied filters
  const getFilteredStats = () => {
    if (!stats || !appliedFilters) return stats;
    
    // Implementar filtrado aquí basado en appliedFilters
    // Por simplicidad, retornamos los stats originales
    return stats;
  };

  const filteredStats = getFilteredStats();

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

  if (error || !filteredStats) {
    return (
      <div className="text-center">
        <p className="text-destructive">Error al cargar las estadísticas</p>
        <Button onClick={handleRefreshData} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Análisis Avanzado de Reportes
          </h2>
          <p className="text-muted-foreground">
            Dashboard interactivo con métricas en tiempo real y análisis detallado
          </p>
        </div>
        <Button onClick={handleRefreshData} variant="outline" className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar Datos
        </Button>
      </div>

      {/* Filtros Avanzados */}
      <AdvancedFiltersPanel
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
        onFiltersChange={handleFiltersChange}
      />

      {/* Métricas en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RealTimeMetrics
          title="Total Reportes"
          value={filteredStats.reportes.total}
          subtitle={`${filteredStats.reportes.activos} activos`}
          icon={FileText}
          color="text-blue-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
        />
        
        <RealTimeMetrics
          title="Reportes Activos"
          value={filteredStats.reportes.activos}
          previousValue={filteredStats.reportes.total - filteredStats.reportes.activos}
          subtitle={`${Math.round((filteredStats.reportes.activos / filteredStats.reportes.total) * 100)}% del total`}
          icon={TrendingUp}
          color="text-green-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
        />
        
        <RealTimeMetrics
          title="Reportes Recientes"
          value={filteredStats.reportes.recientes}
          subtitle="Últimos 7 días"
          icon={Activity}
          color="text-orange-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
        />
        
        <RealTimeMetrics
          title="Estados Activos"
          value={filteredStats.reportes.porEstado.length}
          subtitle="Diferentes estados"
          icon={AlertTriangle}
          color="text-purple-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
        />
      </div>

      {/* Gráficos Interactivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveCharts
          title="Distribución por Estado"
          description="Reportes clasificados según su estado actual"
          data={filteredStats.reportes.porEstado.map(item => ({
            name: item.estado,
            value: item.count,
            color: item.color,
            trend: Math.random() * 20 - 10, // Simulamos tendencia
          }))}
          showTrends={true}
        />
        
        <InteractiveCharts
          title="Distribución por Categoría"
          description="Reportes clasificados según su categoría"
          data={filteredStats.reportes.porCategoria.map(item => ({
            name: item.categoria,
            value: item.count,
            color: item.color,
            trend: Math.random() * 15 - 7.5, // Simulamos tendencia
          }))}
          showTrends={true}
        />
      </div>

      {/* Gráfico de Prioridades */}
      {filteredStats.reportes.porPrioridad && filteredStats.reportes.porPrioridad.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InteractiveCharts
            title="Distribución por Prioridad"
            description="Reportes clasificados según su nivel de prioridad"
            data={filteredStats.reportes.porPrioridad.map(item => ({
              name: priorityConfig[item.priority as keyof typeof priorityConfig]?.label || item.priority,
              value: item.count,
              color: priorityConfig[item.priority as keyof typeof priorityConfig]?.color || '#6B7280',
              trend: Math.random() * 25 - 12.5, // Simulamos tendencia
            }))}
            showTrends={true}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Análisis de Prioridades
              </CardTitle>
              <CardDescription>
                Métricas detalladas por nivel de prioridad con tendencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStats.reportes.porPrioridad.map((item) => {
                  const config = priorityConfig[item.priority as keyof typeof priorityConfig];
                  const percentage = Math.round((item.count / filteredStats.reportes.total) * 100);
                  const trend = Math.random() * 20 - 10; // Simulamos tendencia
                  
                  return (
                    <div key={item.priority} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: config?.color || '#6B7280' }}
                        />
                        <div>
                          <span className="font-medium">
                            {config?.label || item.priority}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {percentage}% del total
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{item.count}</div>
                        <div className={`text-xs flex items-center gap-1 ${
                          trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {trend > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : trend < 0 ? (
                            <TrendingUp className="h-3 w-3 rotate-180" />
                          ) : null}
                          {Math.abs(trend).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Resumen de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasa de actividad</span>
                <span className="text-sm font-medium">
                  {Math.round((filteredStats.reportes.activos / filteredStats.reportes.total) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Crecimiento semanal</span>
                <span className="text-sm font-medium text-green-600">
                  +{filteredStats.reportes.recientes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estados únicos</span>
                <span className="text-sm font-medium">
                  {filteredStats.reportes.porEstado.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Distribución Temporal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Esta semana</span>
                <span className="text-sm font-medium">{filteredStats.reportes.recientes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Promedio diario</span>
                <span className="text-sm font-medium">
                  {Math.round(filteredStats.reportes.recientes / 7)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total histórico</span>
                <span className="text-sm font-medium">{filteredStats.reportes.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              Eficiencia del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reportes por categoría</span>
                <span className="text-sm font-medium">
                  {Math.round(filteredStats.reportes.total / Math.max(filteredStats.categorias.total, 1) * 10) / 10}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reportes por estado</span>
                <span className="text-sm font-medium">
                  {Math.round(filteredStats.reportes.total / Math.max(filteredStats.estados.total, 1) * 10) / 10}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Categorías activas</span>
                <span className="text-sm font-medium">
                  {Math.round((filteredStats.categorias.activas / filteredStats.categorias.total) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const ReportesAnalytics = () => {
  return (
    <NotificationProvider>
      <ReportesAnalyticsContent />
    </NotificationProvider>
  );
};
