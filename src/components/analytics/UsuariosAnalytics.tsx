
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Activity, AlertTriangle, Users, RefreshCw, UserCheck, UserPlus, Shield } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { RealTimeMetrics } from './RealTimeMetrics';
import { InteractiveCharts } from './InteractiveCharts';
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel';
import { AdvancedFilters } from '@/hooks/useAdvancedFilters';
import { useQueryClient } from '@tanstack/react-query';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';

const UsuariosAnalyticsContent = () => {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { users } = useUsers();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
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
      setSelectedUserIds(filters.searchTerm);
    } else if (filters.searchTerm.length === 0 && selectedUserIds.length > 0) {
      setSelectedUserIds([]);
    }
    
    console.log('Filtros aplicados:', filters);
  }, [selectedUserIds]);

  const handleUserSelection = useCallback((userIds: string[]) => {
    setSelectedUserIds(userIds);
    
    if (appliedFilters) {
      setAppliedFilters({
        ...appliedFilters,
        searchTerm: userIds
      });
    }
  }, [appliedFilters]);

  const isDateInRange = (dateString: string, dateRange: { from: Date; to: Date }) => {
    const userDate = new Date(dateString);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    
    return userDate >= fromDate && userDate <= toDate;
  };

  const isValidForComparison = (filters: AdvancedFilters) => {
    switch (filters.activeTab) {
      case 'busqueda':
        return filters.searchTerm.length >= 2;
      case 'fechas':
        return filters.dateRange !== null;
      default:
        return false;
    }
  };

  const hasValidFilters = appliedFilters && isValidForComparison(appliedFilters);

  const getFilteredStats = () => {
    if (!stats || !users) return stats;
    
    if (!hasValidFilters) {
      console.log('Sin filtros válidos - mostrando datos en tiempo real');
      return stats;
    }

    console.log('Aplicando filtros de comparación:', {
      totalUsuarios: stats.usuarios.total,
      usuariosCompletos: users.length,
      filtros: appliedFilters,
      tabActiva: appliedFilters.activeTab
    });

    let filteredUsers = [...users];
    console.log('Usuarios iniciales:', filteredUsers.length);

    switch (appliedFilters.activeTab) {
      case 'busqueda':
        if (appliedFilters.searchTerm.length >= 2) {
          const userIds = appliedFilters.searchTerm;
          filteredUsers = filteredUsers.filter(user => 
            userIds.includes(user.id)
          );
          console.log(`Filtro de búsqueda aplicado: ${filteredUsers.length} usuarios seleccionados`);
        }
        break;

      case 'fechas':
        if (appliedFilters.dateRange) {
          filteredUsers = filteredUsers.filter(user => 
            isDateInRange(user.created_at, appliedFilters.dateRange!)
          );
          console.log(`Filtro de fecha aplicado: ${filteredUsers.length} usuarios en el rango`);
        }
        break;
    }

    console.log('Resultado final del filtrado:', {
      usuariosOriginales: stats.usuarios.total,
      usuariosFiltrados: filteredUsers.length,
      tabActiva: appliedFilters.activeTab
    });

    // Recalcular estadísticas basadas en datos filtrados reales
    const totalFiltrado = filteredUsers.length;
    const activosFiltrado = filteredUsers.filter(u => u.asset).length;
    const confirmadosFiltrado = filteredUsers.filter(u => u.confirmed).length;
    
    // Calcular usuarios recientes (últimos 7 días) en los datos filtrados
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recientesFiltrado = filteredUsers.filter(u => 
      new Date(u.created_at) >= sevenDaysAgo
    ).length;

    // Re-agrupar por estado de activación
    const porEstadoActivacion = [
      { estado: 'Activos', count: activosFiltrado, color: '#10B981' },
      { estado: 'Inactivos', count: totalFiltrado - activosFiltrado, color: '#EF4444' }
    ];

    // Re-agrupar por confirmación
    const porConfirmacion = [
      { categoria: 'Confirmados', count: confirmadosFiltrado, color: '#3B82F6' },
      { categoria: 'No confirmados', count: totalFiltrado - confirmadosFiltrado, color: '#F59E0B' }
    ];

    return {
      ...stats,
      usuarios: {
        ...stats.usuarios,
        total: totalFiltrado,
        activos: activosFiltrado,
        confirmados: confirmadosFiltrado,
        recientes: recientesFiltrado,
        porEstadoActivacion,
        porConfirmacion,
        datosCompletos: filteredUsers,
      }
    };
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
            {hasValidFilters ? 'Análisis Comparativo de Usuarios' : 'Análisis de Usuarios en Tiempo Real'}
          </h2>
          <p className="text-muted-foreground">
            {hasValidFilters 
              ? 'Dashboard interactivo con filtros de comparación aplicados'
              : 'Dashboard en tiempo real mostrando todos los usuarios del sistema'
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
        onMultipleReportSelection={handleUserSelection}
        selectedReportIds={selectedUserIds}
      />

      {/* Indicador de filtros aplicados */}
      {hasValidFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Comparación activa:</h3>
          <div className="flex flex-wrap gap-2 text-sm text-blue-700">
            {appliedFilters.activeTab === 'busqueda' && appliedFilters.searchTerm.length >= 2 && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Usuarios seleccionados: {appliedFilters.searchTerm.length}
              </span>
            )}
            {appliedFilters.activeTab === 'fechas' && appliedFilters.dateRange && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Fechas: {appliedFilters.dateRange.from.toLocaleDateString('es-ES')} - {appliedFilters.dateRange.to.toLocaleDateString('es-ES')}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-blue-600">
            Comparando {filteredStats.usuarios.total} de {stats?.usuarios.total} usuarios
          </div>
        </div>
      )}

      {/* Indicador de vista en tiempo real */}
      {!hasValidFilters && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Vista en Tiempo Real:</h3>
          <div className="text-sm text-green-700">
            Mostrando todos los usuarios del sistema ({stats?.usuarios.total} usuarios)
          </div>
        </div>
      )}

      {/* Métricas en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RealTimeMetrics
          title="Total Usuarios"
          value={filteredStats.usuarios.total}
          previousValue={hasValidFilters ? stats?.usuarios.total : undefined}
          subtitle={`${filteredStats.usuarios.activos} activos`}
          icon={Users}
          color="text-blue-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
        />
        
        <RealTimeMetrics
          title="Usuarios Activos"
          value={filteredStats.usuarios.activos}
          previousValue={hasValidFilters ? stats?.usuarios.activos : undefined}
          subtitle={`${Math.round((filteredStats.usuarios.activos / Math.max(filteredStats.usuarios.total, 1)) * 100)}% del total`}
          icon={UserCheck}
          color="text-green-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
        />
        
        <RealTimeMetrics
          title="Usuarios Confirmados"
          value={filteredStats.usuarios.confirmados}
          previousValue={hasValidFilters ? stats?.usuarios.confirmados : undefined}
          subtitle="Con email verificado"
          icon={Shield}
          color="text-purple-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
        />
        
        <RealTimeMetrics
          title="Nuevos Usuarios"
          value={filteredStats.usuarios.recientes}
          previousValue={hasValidFilters ? stats?.usuarios.recientes : undefined}
          subtitle="Últimos 7 días"
          icon={UserPlus}
          color="text-orange-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
        />
      </div>

      {/* Gráficos Interactivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveCharts
          title="Distribución por Estado"
          description={hasValidFilters ? "Usuarios filtrados clasificados según su estado de activación" : "Todos los usuarios clasificados según su estado de activación"}
          data={(filteredStats.usuarios.porEstadoActivacion || [
            { estado: 'Activos', count: filteredStats.usuarios.activos, color: '#10B981' },
            { estado: 'Inactivos', count: filteredStats.usuarios.total - filteredStats.usuarios.activos, color: '#EF4444' }
          ]).map(item => ({
            name: item.estado,
            value: item.count,
            color: item.color,
          }))}
        />
        
        <InteractiveCharts
          title="Distribución por Confirmación"
          description={hasValidFilters ? "Usuarios filtrados clasificados según su estado de confirmación" : "Todos los usuarios clasificados según su estado de confirmación"}
          data={(filteredStats.usuarios.porConfirmacion || [
            { categoria: 'Confirmados', count: filteredStats.usuarios.confirmados, color: '#3B82F6' },
            { categoria: 'No confirmados', count: filteredStats.usuarios.total - filteredStats.usuarios.confirmados, color: '#F59E0B' }
          ]).map(item => ({
            name: item.categoria,
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
              <UserCheck className="h-5 w-5" />
              Análisis de Activación
            </CardTitle>
            <CardDescription>
              {hasValidFilters ? "Métricas de activación en usuarios filtrados" : "Métricas detalladas de activación de usuarios basadas en datos reales"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <div>
                    <span className="font-medium">Usuarios Activos</span>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((filteredStats.usuarios.activos / Math.max(filteredStats.usuarios.total, 1)) * 100)}% del total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{filteredStats.usuarios.activos}</div>
                  <div className="text-xs text-muted-foreground">usuarios</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <div>
                    <span className="font-medium">Usuarios Inactivos</span>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(((filteredStats.usuarios.total - filteredStats.usuarios.activos) / Math.max(filteredStats.usuarios.total, 1)) * 100)}% del total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{filteredStats.usuarios.total - filteredStats.usuarios.activos}</div>
                  <div className="text-xs text-muted-foreground">usuarios</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Análisis de Confirmación
            </CardTitle>
            <CardDescription>
              {hasValidFilters ? "Métricas de confirmación en usuarios filtrados" : "Métricas detalladas de confirmación de email basadas en datos reales"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <div>
                    <span className="font-medium">Email Confirmado</span>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((filteredStats.usuarios.confirmados / Math.max(filteredStats.usuarios.total, 1)) * 100)}% del total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{filteredStats.usuarios.confirmados}</div>
                  <div className="text-xs text-muted-foreground">usuarios</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-amber-500" />
                  <div>
                    <span className="font-medium">Email Pendiente</span>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(((filteredStats.usuarios.total - filteredStats.usuarios.confirmados) / Math.max(filteredStats.usuarios.total, 1)) * 100)}% del total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{filteredStats.usuarios.total - filteredStats.usuarios.confirmados}</div>
                  <div className="text-xs text-muted-foreground">usuarios</div>
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
              <Users className="h-4 w-4 text-blue-600" />
              Resumen de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasa de activación</span>
                <span className="text-sm font-medium">
                  {Math.round((filteredStats.usuarios.activos / Math.max(filteredStats.usuarios.total, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasa de confirmación</span>
                <span className="text-sm font-medium">
                  {Math.round((filteredStats.usuarios.confirmados / Math.max(filteredStats.usuarios.total, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usuarios recientes</span>
                <span className="text-sm font-medium text-green-600">
                  {filteredStats.usuarios.recientes}
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
                <span className="text-sm font-medium">{filteredStats.usuarios.recientes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Promedio diario</span>
                <span className="text-sm font-medium">
                  {Math.round(filteredStats.usuarios.recientes / 7)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{hasValidFilters ? 'Total filtrado' : 'Total histórico'}</span>
                <span className="text-sm font-medium">{filteredStats.usuarios.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              Eficiencia del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usuarios por rol</span>
                <span className="text-sm font-medium">
                  {(filteredStats.usuarios.total / Math.max(filteredStats.roles.total, 1)).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Asignaciones activas</span>
                <span className="text-sm font-medium">
                  {filteredStats.roles.asignaciones}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Roles activos</span>
                <span className="text-sm font-medium">
                  {Math.round((filteredStats.roles.activos / Math.max(filteredStats.roles.total, 1)) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const UsuariosAnalytics = () => {
  return <UsuariosAnalyticsContent />;
};
