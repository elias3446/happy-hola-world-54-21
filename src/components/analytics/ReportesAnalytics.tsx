
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Activity, AlertTriangle, RefreshCw, MapPin, Clock, CheckCircle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { RealTimeMetrics } from './RealTimeMetrics';
import { InteractiveCharts } from './InteractiveCharts';
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel';
import { AdvancedFilters } from '@/hooks/useAdvancedFilters';
import { useQueryClient } from '@tanstack/react-query';
import { useReportes } from '@/hooks/useReportes';
import { useToast } from '@/hooks/use-toast';

const ReportesAnalyticsContent = () => {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { reportes } = useReportes(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters | null>(null);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRefreshData = useCallback(async () => {
    try {
      await refetch();
      toast({
        title: "Éxito",
        description: "Datos actualizados correctamente",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar los datos",
        variant: "destructive",
      });
    }
  }, [refetch, toast]);

  const handleFiltersChange = useCallback((filters: AdvancedFilters) => {
    setAppliedFilters(filters);
    
    if (filters.searchTerm && filters.searchTerm.length > 0) {
      setSelectedReportIds(filters.searchTerm);
    } else if (filters.searchTerm.length === 0 && selectedReportIds.length > 0) {
      setSelectedReportIds([]);
    }
    
    console.log('Filtros aplicados:', filters);
  }, [selectedReportIds]);

  const handleReportSelection = useCallback((reportIds: string[]) => {
    setSelectedReportIds(reportIds);
    
    if (appliedFilters) {
      setAppliedFilters({
        ...appliedFilters,
        searchTerm: reportIds
      });
    }
  }, [appliedFilters]);

  const isDateInRange = (dateString: string, dateRange: { from: Date; to: Date }) => {
    const reportDate = new Date(dateString);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    
    return reportDate >= fromDate && reportDate <= toDate;
  };

  const isValidForComparison = (filters: AdvancedFilters) => {
    switch (filters.activeTab) {
      case 'busqueda':
        return filters.searchTerm.length >= 2;
      case 'fechas':
        return filters.dateRange !== null;
      case 'prioridad':
        return filters.priority.length > 0;
      case 'estados':
        return filters.estados.length > 0;
      case 'categorias':
        return filters.categorias.length > 0;
      default:
        return false;
    }
  };

  const hasValidFilters = appliedFilters && isValidForComparison(appliedFilters);

  const getFilteredStats = () => {
    if (!stats || !reportes) return null;
    
    if (!hasValidFilters) {
      console.log('Sin filtros válidos - mostrando datos reales de la base de datos');
      return stats;
    }

    console.log('Aplicando filtros de comparación sobre datos reales:', {
      totalReportes: stats.reportes.total,
      reportesCompletos: reportes.length,
      filtros: appliedFilters,
      tabActiva: appliedFilters.activeTab
    });

    let filteredReports = [...reportes];
    console.log('Reportes reales iniciales:', filteredReports.length);

    switch (appliedFilters.activeTab) {
      case 'busqueda':
        if (appliedFilters.searchTerm.length >= 2) {
          const reportIds = [...appliedFilters.searchTerm];
          
          filteredReports = filteredReports.filter(report => 
            reportIds.includes(report.id)
          );
          console.log(`Filtro de búsqueda aplicado: ${filteredReports.length} reportes seleccionados`);
        }
        break;

      case 'fechas':
        if (appliedFilters.dateRange) {
          filteredReports = filteredReports.filter(report => 
            isDateInRange(report.created_at, appliedFilters.dateRange!)
          );
          console.log(`Filtro de fecha aplicado: ${filteredReports.length} reportes en el rango`);
        }
        break;

      case 'prioridad':
        if (appliedFilters.priority.length > 0) {
          filteredReports = filteredReports.filter(report => 
            appliedFilters.priority.includes(report.priority)
          );
          console.log(`Filtro de prioridad aplicado: ${filteredReports.length} reportes con prioridades seleccionadas`);
        }
        break;

      case 'estados':
        if (appliedFilters.estados.length > 0) {
          filteredReports = filteredReports.filter(report => 
            report.estado && appliedFilters.estados.includes(report.estado.nombre)
          );
          console.log(`Filtro de estado aplicado: ${filteredReports.length} reportes con estados seleccionados`);
        }
        break;

      case 'categorias':
        if (appliedFilters.categorias.length > 0) {
          filteredReports = filteredReports.filter(report => 
            report.categoria && appliedFilters.categorias.includes(report.categoria.nombre)
          );
          console.log(`Filtro de categoría aplicado: ${filteredReports.length} reportes con categorías seleccionadas`);
        }
        break;
    }

    console.log('Resultado final del filtrado sobre datos reales:', {
      reportesOriginales: stats.reportes.total,
      reportesFiltrados: filteredReports.length,
      tabActiva: appliedFilters.activeTab
    });

    const totalFiltrado = filteredReports.length;
    const activosFiltrado = filteredReports.filter(r => r.activo === true).length;
    const asignadosFiltrado = filteredReports.filter(r => r.assigned_to !== null).length;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recientesFiltrado = filteredReports.filter(r => 
      new Date(r.created_at) >= sevenDaysAgo
    ).length;

    const porActividad = [
      { actividad: 'Activos', count: activosFiltrado, color: '#10B981' },
      { actividad: 'Inactivos', count: totalFiltrado - activosFiltrado, color: '#EF4444' }
    ];

    const porAsignacion = [
      { asignacion: 'Asignados', count: asignadosFiltrado, color: '#3B82F6' },
      { asignacion: 'Sin asignar', count: totalFiltrado - asignadosFiltrado, color: '#F59E0B' }
    ];

    return {
      ...stats,
      reportes: {
        ...stats.reportes,
        total: totalFiltrado,
        activos: activosFiltrado,
        asignados: asignadosFiltrado,
        recientes: recientesFiltrado,
        porActividad,
        porAsignacion,
        datosCompletos: filteredReports,
      }
    };
  };

  const filteredStats = getFilteredStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando estadísticas desde la base de datos...</p>
        </div>
      </div>
    );
  }

  if (error || !filteredStats) {
    return (
      <div className="text-center">
        <p className="text-destructive">Error al cargar las estadísticas de la base de datos</p>
        <Button onClick={handleRefreshData} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  const safeStats = {
    ...filteredStats,
    reportes: {
      ...filteredStats.reportes,
      porActividad: filteredStats.reportes.porActividad || [],
      porAsignacion: filteredStats.reportes.porAsignacion || [],
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {hasValidFilters ? 'Análisis Comparativo de Reportes (Datos Reales)' : 'Análisis de Reportes en Tiempo Real (Datos Reales)'}
          </h2>
          <p className="text-muted-foreground">
            {hasValidFilters 
              ? 'Dashboard con filtros aplicados sobre datos reales de la base de datos'
              : 'Dashboard en tiempo real con datos reales de la base de datos'
            }
          </p>
        </div>
        <Button onClick={handleRefreshData} variant="outline" className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar Datos
        </Button>
      </div>

      {/* Filtros de Comparación */}
      <AdvancedFiltersPanel
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
        onFiltersChange={handleFiltersChange}
        onMultipleReportSelection={handleReportSelection}
        selectedReportIds={selectedReportIds}
        context="reportes"
      />

      {/* Indicador de filtros aplicados */}
      {hasValidFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Comparación activa sobre datos reales:</h3>
          <div className="flex flex-wrap gap-2 text-sm text-blue-700">
            {appliedFilters.activeTab === 'busqueda' && appliedFilters.searchTerm.length >= 2 && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Reportes seleccionados: {appliedFilters.searchTerm.length}
              </span>
            )}
            {appliedFilters.activeTab === 'fechas' && appliedFilters.dateRange && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Fechas: {appliedFilters.dateRange.from.toLocaleDateString('es-ES')} - {appliedFilters.dateRange.to.toLocaleDateString('es-ES')}
              </span>
            )}
            {appliedFilters.activeTab === 'prioridad' && appliedFilters.priority.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Prioridades: {appliedFilters.priority.join(', ')}
              </span>
            )}
            {appliedFilters.activeTab === 'estados' && appliedFilters.estados.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Estados: {appliedFilters.estados.join(', ')}
              </span>
            )}
            {appliedFilters.activeTab === 'categorias' && appliedFilters.categorias.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Categorías: {appliedFilters.categorias.join(', ')}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-blue-600">
            Datos reales: {safeStats.reportes.total} de {stats?.reportes.total} reportes
          </div>
        </div>
      )}

      {/* Indicador de vista en tiempo real */}
      {!hasValidFilters && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Vista en Tiempo Real (Datos Reales):</h3>
          <div className="text-sm text-green-700">
            Mostrando todos los reportes reales de la base de datos ({stats?.reportes.total} reportes)
          </div>
        </div>
      )}

      {/* Métricas en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RealTimeMetrics
          title="Total Reportes"
          value={safeStats.reportes.total}
          previousValue={hasValidFilters ? stats?.reportes.total : undefined}
          subtitle={`${safeStats.reportes.activos} activos`}
          icon={FileText}
          color="text-blue-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
          showSparkline={false}
        />
        
        <RealTimeMetrics
          title="Reportes Activos"
          value={safeStats.reportes.activos}
          previousValue={hasValidFilters ? stats?.reportes.activos : undefined}
          subtitle={`${Math.round((safeStats.reportes.activos / Math.max(safeStats.reportes.total, 1)) * 100)}% del total`}
          icon={CheckCircle}
          color="text-green-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
          showSparkline={false}
        />
        
        <RealTimeMetrics
          title="Reportes Asignados"
          value={safeStats.reportes.asignados}
          previousValue={hasValidFilters ? stats?.reportes.asignados : undefined}
          subtitle="Con responsable asignado"
          icon={MapPin}
          color="text-purple-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
          showSparkline={false}
        />
        
        <RealTimeMetrics
          title="Nuevos Reportes"
          value={safeStats.reportes.recientes}
          previousValue={hasValidFilters ? stats?.reportes.recientes : undefined}
          subtitle="Últimos 7 días"
          icon={Clock}
          color="text-orange-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
          showSparkline={false}
        />
      </div>

      {/* Gráficos Interactivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveCharts
          title="Distribución por Actividad"
          description={hasValidFilters ? "Reportes filtrados según su estado de actividad (datos reales)" : "Todos los reportes según su estado de actividad (datos reales)"}
          data={safeStats.reportes.porActividad.map(item => ({
            name: item.actividad,
            value: item.count,
            color: item.color,
          }))}
        />
        
        <InteractiveCharts
          title="Distribución por Asignación"
          description={hasValidFilters ? "Reportes filtrados según su asignación (datos reales)" : "Todos los reportes según su asignación (datos reales)"}
          data={safeStats.reportes.porAsignacion.map(item => ({
            name: item.asignacion,
            value: item.count,
            color: item.color,
          }))}
        />
      </div>

      {/* Análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Análisis de Actividad (Datos Reales)
            </CardTitle>
            <CardDescription>
              {hasValidFilters ? "Métricas de actividad en reportes filtrados (datos reales)" : "Métricas detalladas de actividad basadas en datos reales de la base de datos"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <div>
                    <span className="font-medium">Reportes Activos</span>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((safeStats.reportes.activos / Math.max(safeStats.reportes.total, 1)) * 100)}% del total real
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{safeStats.reportes.activos}</div>
                  <div className="text-xs text-muted-foreground">reportes</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <div>
                    <span className="font-medium">Reportes Inactivos</span>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(((safeStats.reportes.total - safeStats.reportes.activos) / Math.max(safeStats.reportes.total, 1)) * 100)}% del total real
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{safeStats.reportes.total - safeStats.reportes.activos}</div>
                  <div className="text-xs text-muted-foreground">reportes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Análisis de Asignación (Datos Reales)
            </CardTitle>
            <CardDescription>
              {hasValidFilters ? "Métricas de asignación en reportes filtrados (datos reales)" : "Métricas detalladas de asignación basadas en datos reales de la base de datos"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <div>
                    <span className="font-medium">Reportes Asignados</span>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((safeStats.reportes.asignados / Math.max(safeStats.reportes.total, 1)) * 100)}% del total real
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{safeStats.reportes.asignados}</div>
                  <div className="text-xs text-muted-foreground">reportes</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-amber-500" />
                  <div>
                    <span className="font-medium">Sin Asignar</span>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(((safeStats.reportes.total - safeStats.reportes.asignados) / Math.max(safeStats.reportes.total, 1)) * 100)}% del total real
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{safeStats.reportes.total - safeStats.reportes.asignados}</div>
                  <div className="text-xs text-muted-foreground">reportes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Resumen de Actividad (Datos Reales)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasa de actividad real</span>
                <span className="text-sm font-medium">
                  {Math.round((safeStats.reportes.activos / Math.max(safeStats.reportes.total, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasa de asignación real</span>
                <span className="text-sm font-medium">
                  {Math.round((safeStats.reportes.asignados / Math.max(safeStats.reportes.total, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reportes recientes (BD)</span>
                <span className="text-sm font-medium text-green-600">
                  {safeStats.reportes.recientes}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Distribución Temporal (Datos Reales)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Esta semana (BD)</span>
                <span className="text-sm font-medium">{safeStats.reportes.recientes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Promedio diario real</span>
                <span className="text-sm font-medium">
                  {Math.round(safeStats.reportes.recientes / 7)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{hasValidFilters ? 'Total filtrado (BD)' : 'Total histórico (BD)'}</span>
                <span className="text-sm font-medium">{safeStats.reportes.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Eficiencia del Sistema (Datos Reales)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reportes por categoría (BD)</span>
                <span className="text-sm font-medium">
                  {(safeStats.reportes.total / Math.max(stats?.categorias.total || 1, 1)).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estados en uso (BD)</span>
                <span className="text-sm font-medium">
                  {stats?.estados.activos || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Categorías activas (BD)</span>
                <span className="text-sm font-medium">
                  {Math.round(((stats?.categorias.activas || 0) / Math.max(stats?.categorias.total || 1, 1)) * 100)}%
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
  return <ReportesAnalyticsContent />;
};
