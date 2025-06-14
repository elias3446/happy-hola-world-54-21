import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Activity, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { RealTimeMetrics } from './RealTimeMetrics';
import { InteractiveCharts } from './InteractiveCharts';
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel';
import { MultiReportComparison } from './MultiReportComparison';
import { NotificationProvider, useNotifications } from './NotificationSystem';
import { AdvancedFilters } from '@/hooks/useAdvancedFilters';
import { useQueryClient } from '@tanstack/react-query';
import { useReportes } from '@/hooks/useReportes';

const priorityConfig = {
  urgente: { color: '#DC2626', label: 'Urgente' },
  alto: { color: '#EA580C', label: 'Alto' },
  medio: { color: '#D97706', label: 'Medio' },
  bajo: { color: '#059669', label: 'Bajo' },
};

const ReportesAnalyticsContent = () => {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { reportes } = useReportes();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters | null>(null);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
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
    
    // Actualizar reportes seleccionados basado en el filtro de búsqueda
    if (filters.searchTerm && filters.searchTerm.length > 0) {
      setSelectedReportIds([filters.searchTerm]);
    } else if (filters.searchTerm.length === 0 && selectedReportIds.length > 0) {
      // Si se limpia la búsqueda, mantener las selecciones actuales
    }
    
    console.log('Filtros aplicados:', filters);
  }, [selectedReportIds]);

  // Función para manejar selección múltiple de reportes
  const handleReportSelection = useCallback((reportTitles: string[]) => {
    if (!reportes) return;
    
    // Convertir títulos a IDs
    const reportIds = reportTitles.map(title => {
      const reporte = reportes.find(r => r.nombre === title);
      return reporte?.id || title;
    });
    
    setSelectedReportIds(reportIds);
    
    // Actualizar filtros para mantener sincronización
    if (appliedFilters) {
      setAppliedFilters({
        ...appliedFilters,
        searchTerm: reportTitles.join(', ') // Para compatibilidad con filtros existentes
      });
    }
  }, [reportes, appliedFilters]);

  // Función corregida para verificar si una fecha está en el rango especificado
  const isDateInRange = (dateString: string, dateRange: { from: Date; to: Date }) => {
    const reportDate = new Date(dateString);
    
    // Crear nuevas fechas para el rango sin modificar las originales
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    // Establecer las horas para comparación completa del día
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    
    return reportDate >= fromDate && reportDate <= toDate;
  };

  // Función mejorada para filtrar por reportes seleccionados específicos
  const filterBySelectedReports = (filteredReportes: any[], selectedIds: string[]) => {
    if (selectedIds.length === 0) return filteredReportes;

    console.log('Aplicando filtro de reportes seleccionados:', selectedIds);
    
    const result = filteredReportes.filter(reporte => selectedIds.includes(reporte.id));
    console.log(`Filtro de reportes específicos aplicado: ${result.length} reportes`);
    return result;
  };

  // Filtrar datos usando los datos reales de la base de datos
  const getFilteredStats = () => {
    if (!stats) return stats;

    // Verificar si hay filtros activos (incluyendo selección de reportes)
    const hasActiveFilters = 
      (appliedFilters && (
        appliedFilters.dateRange !== null ||
        appliedFilters.priority.length > 0 ||
        appliedFilters.estados.length > 0 ||
        appliedFilters.categorias.length > 0
      )) ||
      selectedReportIds.length > 0;

    if (!hasActiveFilters) {
      console.log('No hay filtros activos, retornando datos originales');
      return stats;
    }

    console.log('Aplicando filtros a datos:', {
      totalReportes: stats.reportes.total,
      datosCompletos: stats.reportes.datosCompletos.length,
      filtros: appliedFilters,
      reportesSeleccionados: selectedReportIds
    });

    // Usar los datos completos reales de la base de datos
    let filteredReportes = [...stats.reportes.datosCompletos];
    console.log('Reportes iniciales:', filteredReportes.length);

    // Aplicar filtro de reportes seleccionados PRIMERO
    if (selectedReportIds.length > 0) {
      filteredReportes = filterBySelectedReports(filteredReportes, selectedReportIds);
    }

    // Aplicar otros filtros solo si appliedFilters existe
    if (appliedFilters) {
      // Aplicar filtro de rango de fechas
      if (appliedFilters.dateRange) {
        const reportesAntesDelFiltro = filteredReportes.length;
        filteredReportes = filteredReportes.filter(reporte => 
          isDateInRange(reporte.created_at, appliedFilters.dateRange!)
        );
        console.log(`Filtro de fecha aplicado: ${filteredReportes.length}/${reportesAntesDelFiltro} reportes en el rango`);
      }

      // Aplicar filtro de prioridades
      if (appliedFilters.priority.length > 0) {
        const reportesAntesDelFiltro = filteredReportes.length;
        filteredReportes = filteredReportes.filter(reporte => 
          appliedFilters.priority.includes(reporte.priority)
        );
        console.log(`Filtro de prioridad aplicado: ${filteredReportes.length}/${reportesAntesDelFiltro} reportes`);
      }

      // Aplicar filtro de estados
      if (appliedFilters.estados.length > 0) {
        const reportesAntesDelFiltro = filteredReportes.length;
        filteredReportes = filteredReportes.filter(reporte => 
          reporte.estado && appliedFilters.estados.includes(reporte.estado.nombre)
        );
        console.log(`Filtro de estado aplicado: ${filteredReportes.length}/${reportesAntesDelFiltro} reportes`);
      }

      // Aplicar filtro de categorías
      if (appliedFilters.categorias.length > 0) {
        const reportesAntesDelFiltro = filteredReportes.length;
        filteredReportes = filteredReportes.filter(reporte => 
          reporte.categoria && appliedFilters.categorias.includes(reporte.categoria.nombre)
        );
        console.log(`Filtro de categoría aplicado: ${filteredReportes.length}/${reportesAntesDelFiltro} reportes`);
      }
    }

    console.log('Resultado final del filtrado:', {
      reportesOriginales: stats.reportes.total,
      reportesFiltrados: filteredReportes.length
    });

    // Recalcular estadísticas basadas en los datos filtrados reales
    const totalFiltrado = filteredReportes.length;
    const activosFiltrado = filteredReportes.filter(r => r.activo).length;
    
    // Calcular reportes recientes (últimos 7 días) en los datos filtrados
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recientesFiltrado = filteredReportes.filter(r => 
      new Date(r.created_at) >= sevenDaysAgo
    ).length;

    // Reagrupar por estado basado en datos filtrados
    const porEstadoFiltrado = filteredReportes.reduce((acc, reporte) => {
      const estadoNombre = reporte.estado?.nombre || 'Sin estado';
      const estadoColor = reporte.estado?.color || '#6B7280';
      const existing = acc.find(item => item.estado === estadoNombre);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ estado: estadoNombre, count: 1, color: estadoColor });
      }
      return acc;
    }, [] as { estado: string; count: number; color: string }[]);

    // Reagrupar por categoría basado en datos filtrados
    const porCategoriaFiltrado = filteredReportes.reduce((acc, reporte) => {
      const categoriaNombre = reporte.categoria?.nombre || 'Sin categoría';
      const categoriaColor = reporte.categoria?.color || '#6B7280';
      const existing = acc.find(item => item.categoria === categoriaNombre);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ categoria: categoriaNombre, count: 1, color: categoriaColor });
      }
      return acc;
    }, [] as { categoria: string; count: number; color: string }[]);

    // Reagrupar por prioridad basado en datos filtrados
    const porPrioridadFiltrado = filteredReportes.reduce((acc, reporte) => {
      const prioridad = reporte.priority;
      const existing = acc.find(item => item.priority === prioridad);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ priority: prioridad, count: 1 });
      }
      return acc;
    }, [] as { priority: string; count: number }[]);

    return {
      ...stats,
      reportes: {
        ...stats.reportes,
        total: totalFiltrado,
        activos: activosFiltrado,
        recientes: recientesFiltrado,
        porEstado: porEstadoFiltrado,
        porCategoria: porCategoriaFiltrado,
        porPrioridad: porPrioridadFiltrado,
        datosCompletos: filteredReportes,
      }
    };
  };

  const filteredStats = getFilteredStats();

  // Preparar datos para comparación múltiple
  const reportesParaComparacion = selectedReportIds.length > 0 && reportes ? 
    reportes
      .filter(r => selectedReportIds.includes(r.id))
      .map(r => ({
        id: r.id,
        titulo: r.nombre,
        estado: r.estado?.nombre || 'Sin estado',
        categoria: r.categoria?.nombre || 'Sin categoría',
        prioridad: r.priority,
        fechaCreacion: r.created_at,
        activo: r.activo
      })) : [];

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
            Dashboard interactivo con métricas en tiempo real y análisis comparativo
          </p>
        </div>
        <Button onClick={handleRefreshData} variant="outline" className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar Datos
        </Button>
      </div>

      {/* Filtros Avanzados - Actualizado para soportar selección múltiple */}
      <AdvancedFiltersPanel
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
        onFiltersChange={handleFiltersChange}
        onMultipleReportSelection={handleReportSelection}
        selectedReportIds={selectedReportIds}
      />

      {/* Comparación múltiple de reportes */}
      {reportesParaComparacion.length > 0 && (
        <MultiReportComparison reportesSeleccionados={reportesParaComparacion} />
      )}

      {/* Indicador de filtros aplicados */}
      {(appliedFilters && (appliedFilters.priority.length > 0 || appliedFilters.estados.length > 0 || appliedFilters.categorias.length > 0 || appliedFilters.dateRange)) || selectedReportIds.length > 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Filtros aplicados:</h3>
          <div className="flex flex-wrap gap-2 text-sm text-blue-700">
            {selectedReportIds.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Reportes seleccionados: {selectedReportIds.length}
              </span>
            )}
            {appliedFilters?.dateRange && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Fechas: {appliedFilters.dateRange.from.toLocaleDateString('es-ES')} - {appliedFilters.dateRange.to.toLocaleDateString('es-ES')}
              </span>
            )}
            {appliedFilters?.priority.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">Prioridades: {appliedFilters.priority.join(', ')}</span>
            )}
            {appliedFilters?.estados.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">Estados: {appliedFilters.estados.join(', ')}</span>
            )}
            {appliedFilters?.categorias.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">Categorías: {appliedFilters.categorias.join(', ')}</span>
            )}
          </div>
          <div className="mt-2 text-xs text-blue-600">
            Mostrando {filteredStats.reportes.total} de {stats?.reportes.total} reportes
          </div>
        </div>
      ) : null}

      {/* Métricas en Tiempo Real - Siempre visibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RealTimeMetrics
          title="Total Reportes"
          value={filteredStats.reportes.total}
          previousValue={stats?.reportes.total}
          subtitle={`${filteredStats.reportes.activos} activos`}
          icon={FileText}
          color="text-blue-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
        />
        
        <RealTimeMetrics
          title="Reportes Activos"
          value={filteredStats.reportes.activos}
          previousValue={stats?.reportes.activos}
          subtitle={`${Math.round((filteredStats.reportes.activos / Math.max(filteredStats.reportes.total, 1)) * 100)}% del total`}
          icon={TrendingUp}
          color="text-green-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
        />
        
        <RealTimeMetrics
          title="Reportes Recientes"
          value={filteredStats.reportes.recientes}
          previousValue={stats?.reportes.recientes}
          subtitle="Últimos 7 días"
          icon={Activity}
          color="text-orange-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
        />
        
        <RealTimeMetrics
          title="Estados Activos"
          value={filteredStats.reportes.porEstado.length}
          previousValue={stats?.reportes.porEstado.length}
          subtitle="Diferentes estados"
          icon={AlertTriangle}
          color="text-purple-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
        />
      </div>

      {/* Gráficos Interactivos - Siempre visibles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveCharts
          title="Distribución por Estado"
          description="Reportes clasificados según su estado actual"
          data={filteredStats.reportes.porEstado.map(item => ({
            name: item.estado,
            value: item.count,
            color: item.color,
            trend: Math.random() * 20 - 10,
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
            trend: Math.random() * 15 - 7.5,
          }))}
          showTrends={true}
        />
      </div>

      {/* Gráfico de Prioridades - Siempre visible si hay datos */}
      {filteredStats.reportes.porPrioridad && filteredStats.reportes.porPrioridad.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InteractiveCharts
            title="Distribución por Prioridad"
            description="Reportes clasificados según su nivel de prioridad"
            data={filteredStats.reportes.porPrioridad.map(item => ({
              name: priorityConfig[item.priority as keyof typeof priorityConfig]?.label || item.priority,
              value: item.count,
              color: priorityConfig[item.priority as keyof typeof priorityConfig]?.color || '#6B7280',
              trend: Math.random() * 25 - 12.5,
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
                  const percentage = Math.round((item.count / Math.max(filteredStats.reportes.total, 1)) * 100);
                  const trend = Math.random() * 20 - 10;
                  
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

      {/* Métricas adicionales - Siempre visibles */}
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
                  {Math.round((filteredStats.reportes.activos / Math.max(filteredStats.reportes.total, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reportes recientes</span>
                <span className="text-sm font-medium text-green-600">
                  {filteredStats.reportes.recientes}
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
                  {(filteredStats.reportes.total / Math.max(filteredStats.categorias.total, 1)).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reportes por estado</span>
                <span className="text-sm font-medium">
                  {(filteredStats.reportes.total / Math.max(filteredStats.estados.total, 1)).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Categorías activas</span>
                <span className="text-sm font-medium">
                  {Math.round((filteredStats.categorias.activas / Math.max(filteredStats.categorias.total, 1)) * 100)}%
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
