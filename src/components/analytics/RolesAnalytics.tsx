
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Settings, Activity, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRoles } from '@/hooks/useRoles';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RealTimeMetrics } from './RealTimeMetrics';
import { InteractiveCharts } from './InteractiveCharts';
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel';
import { ActivityPeakChart } from './ActivityPeakChart';
import { AdvancedFilters } from '@/hooks/useAdvancedFilters';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const RolesAnalyticsContent = () => {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { roles } = useRoles();
  const { userRoles } = useUserRoles();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
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
    
    // Actualizar los IDs seleccionados cuando cambien los filtros de búsqueda
    if (filters.searchTerm && filters.searchTerm.length > 0) {
      setSelectedRoleIds(filters.searchTerm);
    } else if (filters.searchTerm.length === 0 && selectedRoleIds.length > 0) {
      setSelectedRoleIds([]);
    }
    
    console.log('Filtros aplicados en Roles:', filters);
  }, [selectedRoleIds]);

  const handleRoleSelection = useCallback((roleIds: string[]) => {
    setSelectedRoleIds(roleIds);
    
    if (appliedFilters) {
      setAppliedFilters({
        ...appliedFilters,
        searchTerm: roleIds
      });
    }
  }, [appliedFilters]);

  const isDateInRange = (dateString: string, dateRange: { from: Date; to: Date }) => {
    const roleDate = new Date(dateString);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    
    return roleDate >= fromDate && roleDate <= toDate;
  };

  const isValidForComparison = (filters: AdvancedFilters) => {
    switch (filters.activeTab) {
      case 'busqueda':
        return filters.searchTerm.length >= 1;
      case 'fechas':
        return filters.dateRange !== null;
      case 'prioridad':
        return filters.priority.length > 0; // Estados del rol (activo/inactivo)
      case 'estados':
        return filters.estados.length > 0; // Cantidad de permisos
      case 'categorias':
        return filters.categorias.length > 0; // Tipos de permisos
      default:
        return false;
    }
  };

  const hasValidFilters = appliedFilters && isValidForComparison(appliedFilters);

  const getFilteredStats = () => {
    if (!stats || !roles) return stats;
    
    if (!hasValidFilters) {
      console.log('Sin filtros válidos - mostrando datos en tiempo real para roles');
      return stats;
    }

    console.log('Aplicando filtros de comparación para roles:', {
      totalRoles: roles.length,
      filtros: appliedFilters,
      tabActiva: appliedFilters.activeTab
    });

    let filteredRoles = [...roles];
    console.log('Roles iniciales:', filteredRoles.length);

    switch (appliedFilters.activeTab) {
      case 'busqueda':
        if (appliedFilters.searchTerm.length >= 1) {
          const roleIds = appliedFilters.searchTerm;
          filteredRoles = filteredRoles.filter(role => 
            roleIds.includes(role.id)
          );
          console.log(`Filtro de búsqueda aplicado: ${filteredRoles.length} roles seleccionados`);
        }
        break;

      case 'fechas':
        if (appliedFilters.dateRange) {
          filteredRoles = filteredRoles.filter(role => 
            isDateInRange(role.created_at, appliedFilters.dateRange!)
          );
          console.log(`Filtro de fecha aplicado: ${filteredRoles.length} roles en el rango`);
        }
        break;

      case 'prioridad':
        if (appliedFilters.priority.length > 0) {
          filteredRoles = filteredRoles.filter(role => {
            const estado = role.activo ? 'Activo' : 'Inactivo';
            return appliedFilters.priority.includes(estado);
          });
          console.log(`Filtro de estado aplicado: ${filteredRoles.length} roles`);
        }
        break;

      case 'estados':
        if (appliedFilters.estados.length > 0) {
          filteredRoles = filteredRoles.filter(role => {
            const cantidadPermisos = role.permisos.length;
            let categoria = '';
            if (cantidadPermisos === 0) categoria = 'Sin permisos';
            else if (cantidadPermisos <= 5) categoria = 'Pocos permisos';
            else if (cantidadPermisos <= 10) categoria = 'Permisos moderados';
            else categoria = 'Muchos permisos';
            
            return appliedFilters.estados.includes(categoria);
          });
          console.log(`Filtro de cantidad de permisos aplicado: ${filteredRoles.length} roles`);
        }
        break;

      case 'categorias':
        if (appliedFilters.categorias.length > 0) {
          filteredRoles = filteredRoles.filter(role => {
            // Analizar tipos de permisos
            const tienePermisosSoloLectura = role.permisos.every(p => p.startsWith('ver_'));
            const tienePermisosCompletos = role.permisos.some(p => !p.startsWith('ver_'));
            
            let tipoPermiso = '';
            if (role.permisos.length === 0) tipoPermiso = 'Sin permisos';
            else if (tienePermisosSoloLectura) tipoPermiso = 'Solo lectura';
            else if (tienePermisosCompletos) tipoPermiso = 'Permisos completos';
            
            return appliedFilters.categorias.includes(tipoPermiso);
          });
          console.log(`Filtro de tipo de permisos aplicado: ${filteredRoles.length} roles`);
        }
        break;
    }

    // Recalcular estadísticas basadas en roles filtrados
    const totalFiltrado = filteredRoles.length;
    const activosFiltrado = filteredRoles.filter(r => r.activo).length;
    
    // Calcular roles recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recientesFiltrado = filteredRoles.filter(r => 
      new Date(r.created_at) >= sevenDaysAgo
    ).length;

    // Calcular asignaciones para roles filtrados
    const asignacionesFiltrado = userRoles?.filter(ur => 
      filteredRoles.some(fr => fr.id === ur.role_id)
    ).length || 0;

    // Re-agrupar por estado
    const porEstadoFiltrado = [
      { 
        estado: 'Activos', 
        count: filteredRoles.filter(r => r.activo).length, 
        color: '#10B981' 
      },
      { 
        estado: 'Inactivos', 
        count: filteredRoles.filter(r => !r.activo).length, 
        color: '#EF4444' 
      }
    ].filter(item => item.count > 0);

    // Re-agrupar por cantidad de permisos
    const porCantidadPermisos = filteredRoles.reduce((acc, role) => {
      const cantidadPermisos = role.permisos.length;
      let categoria = '';
      let color = '';
      
      if (cantidadPermisos === 0) {
        categoria = 'Sin permisos';
        color = '#6B7280';
      } else if (cantidadPermisos <= 5) {
        categoria = 'Pocos permisos';
        color = '#F59E0B';
      } else if (cantidadPermisos <= 10) {
        categoria = 'Permisos moderados';
        color = '#3B82F6';
      } else {
        categoria = 'Muchos permisos';
        color = '#10B981';
      }
      
      const existing = acc.find(item => item.categoria === categoria);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ categoria, count: 1, color });
      }
      return acc;
    }, [] as { categoria: string; count: number; color: string }[]);

    // Re-agrupar por tipo de permisos
    const porTipoPermisos = filteredRoles.reduce((acc, role) => {
      let tipoPermiso = '';
      let color = '';
      
      if (role.permisos.length === 0) {
        tipoPermiso = 'Sin permisos';
        color = '#6B7280';
      } else if (role.permisos.every(p => p.startsWith('ver_'))) {
        tipoPermiso = 'Solo lectura';
        color = '#F59E0B';
      } else {
        tipoPermiso = 'Permisos completos';
        color = '#10B981';
      }
      
      const existing = acc.find(item => item.tipo === tipoPermiso);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ tipo: tipoPermiso, count: 1, color });
      }
      return acc;
    }, [] as { tipo: string; count: number; color: string }[]);

    return {
      ...stats,
      roles: {
        ...stats.roles,
        total: totalFiltrado,
        activos: activosFiltrado,
        asignaciones: asignacionesFiltrado,
        recientes: recientesFiltrado,
        porEstado: porEstadoFiltrado,
        porCantidadPermisos,
        porTipoPermisos,
        datosCompletos: filteredRoles,
      }
    };
  };

  const filteredStats = getFilteredStats();

  // Preparar datos para comparación múltiple de roles
  const rolesParaComparacion = selectedRoleIds.length > 0 && roles ? 
    roles
      .filter(r => selectedRoleIds.includes(r.id))
      .map(r => {
        const asignaciones = userRoles?.filter(ur => ur.role_id === r.id).length || 0;
        return {
          id: r.id,
          nombre: r.nombre,
          descripcion: r.descripcion,
          activo: r.activo,
          permisos: r.permisos.length,
          asignaciones,
          fechaCreacion: r.created_at
        };
      }) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando estadísticas de roles...</p>
        </div>
      </div>
    );
  }

  if (error || !filteredStats) {
    return (
      <div className="text-center">
        <p className="text-destructive">Error al cargar las estadísticas de roles</p>
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
            {hasValidFilters ? 'Análisis Comparativo de Roles' : 'Análisis de Roles en Tiempo Real'}
          </h2>
          <p className="text-muted-foreground">
            {hasValidFilters 
              ? 'Dashboard interactivo con filtros de comparación aplicados a los roles del sistema'
              : 'Dashboard en tiempo real mostrando todos los roles y sus asignaciones del sistema'
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
        onMultipleReportSelection={handleRoleSelection}
        selectedReportIds={selectedRoleIds}
        context="roles"
      />

      {/* Indicador de filtros aplicados */}
      {hasValidFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Comparación activa:</h3>
          <div className="flex flex-wrap gap-2 text-sm text-blue-700">
            {appliedFilters.activeTab === 'busqueda' && appliedFilters.searchTerm.length >= 1 && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Roles seleccionados: {appliedFilters.searchTerm.length}
              </span>
            )}
            {appliedFilters.activeTab === 'fechas' && appliedFilters.dateRange && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Fechas: {appliedFilters.dateRange.from.toLocaleDateString('es-ES')} - {appliedFilters.dateRange.to.toLocaleDateString('es-ES')}
              </span>
            )}
            {appliedFilters.activeTab === 'prioridad' && appliedFilters.priority.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">Estados: {appliedFilters.priority.join(', ')}</span>
            )}
            {appliedFilters.activeTab === 'estados' && appliedFilters.estados.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">Cantidad permisos: {appliedFilters.estados.join(', ')}</span>
            )}
            {appliedFilters.activeTab === 'categorias' && appliedFilters.categorias.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">Tipo permisos: {appliedFilters.categorias.join(', ')}</span>
            )}
          </div>
          <div className="mt-2 text-xs text-blue-600">
            Comparando {filteredStats.roles.total} de {stats?.roles.total} roles
          </div>
        </div>
      )}

      {/* Indicador de vista en tiempo real */}
      {!hasValidFilters && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Vista en Tiempo Real:</h3>
          <div className="text-sm text-green-700">
            Mostrando todos los roles del sistema ({stats?.roles.total} roles)
          </div>
        </div>
      )}

      {/* Métricas en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RealTimeMetrics
          title="Total Roles"
          value={filteredStats.roles.total}
          subtitle={`${filteredStats.roles.activos} activos`}
          icon={Shield}
          color="text-purple-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['roles'] })}
          showHourlyChart={false}
        />
        
        <RealTimeMetrics
          title="Roles Activos"
          value={filteredStats.roles.activos}
          subtitle={`${Math.round((filteredStats.roles.activos / Math.max(filteredStats.roles.total, 1)) * 100)}% del total`}
          icon={TrendingUp}
          color="text-green-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['roles'] })}
          showHourlyChart={false}
        />
        
        <RealTimeMetrics
          title="Asignaciones"
          value={filteredStats.roles.asignaciones}
          subtitle="Usuarios con roles"
          icon={Users}
          color="text-blue-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['user-roles'] })}
          showHourlyChart={false}
        />
        
        <RealTimeMetrics
          title="Roles Recientes"
          value={filteredStats.roles.recientes || 0}
          subtitle="Últimos 7 días"
          icon={Activity}
          color="text-orange-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['roles'] })}
          showHourlyChart={false}
        />
      </div>

      {/* Gráfico de Pico de Actividad - Roles */}
      <ActivityPeakChart
        data={filteredStats.roles.datosCompletos || []}
        title={hasValidFilters ? "Creación de Roles - Filtrados" : "Creación de Roles - Histórico"}
        subtitle={hasValidFilters 
          ? `Distribución temporal de ${filteredStats.roles.total} roles filtrados`
          : `Distribución temporal de todos los roles (${filteredStats.roles.total} total)`
        }
        color="#8b5cf6"
      />

      {/* Gráficos Interactivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStats.roles.porEstado && filteredStats.roles.porEstado.length > 0 && (
          <InteractiveCharts
            title="Distribución por Estado"
            description={hasValidFilters ? "Roles filtrados clasificados según su estado" : "Todos los roles clasificados según su estado"}
            data={filteredStats.roles.porEstado.map(item => ({
              name: item.estado,
              value: item.count,
              color: item.color,
            }))}
          />
        )}
        
        {filteredStats.roles.porCantidadPermisos && filteredStats.roles.porCantidadPermisos.length > 0 && (
          <InteractiveCharts
            title="Distribución por Cantidad de Permisos"
            description={hasValidFilters ? "Roles filtrados clasificados según la cantidad de permisos" : "Todos los roles clasificados según la cantidad de permisos"}
            data={filteredStats.roles.porCantidadPermisos.map(item => ({
              name: item.categoria,
              value: item.count,
              color: item.color,
            }))}
          />
        )}
      </div>

      {filteredStats.roles.porTipoPermisos && filteredStats.roles.porTipoPermisos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InteractiveCharts
            title="Distribución por Tipo de Permisos"
            description={hasValidFilters ? "Roles filtrados clasificados según el tipo de permisos" : "Todos los roles clasificados según el tipo de permisos"}
            data={filteredStats.roles.porTipoPermisos.map(item => ({
              name: item.tipo,
              value: item.count,
              color: item.color,
            }))}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Análisis Detallado de Roles
              </CardTitle>
              <CardDescription>
                {hasValidFilters ? "Métricas detalladas de roles filtrados" : "Métricas detalladas basadas en todos los roles del sistema"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles?.filter(role => 
                  !hasValidFilters || filteredStats.roles.datosCompletos?.some(fr => fr.id === role.id)
                ).slice(0, 5).map((role) => {
                  const asignaciones = userRoles?.filter(ur => ur.role_id === role.id).length || 0;
                  const percentage = Math.round((asignaciones / Math.max(filteredStats.roles.asignaciones, 1)) * 100);
                  
                  return (
                    <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <div>
                          <span className="font-medium">{role.nombre}</span>
                          <div className="text-xs text-muted-foreground">
                            {role.permisos.length} permisos • {percentage}% de asignaciones
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{asignaciones}</div>
                        <div className="text-xs text-muted-foreground">usuarios</div>
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
              <Shield className="h-4 w-4 text-purple-600" />
              Resumen de Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasa de activación</span>
                <span className="text-sm font-medium">
                  {Math.round((filteredStats.roles.activos / Math.max(filteredStats.roles.total, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Roles con asignaciones</span>
                <span className="text-sm font-medium text-green-600">
                  {roles?.filter(r => userRoles?.some(ur => ur.role_id === r.id)).length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Roles recientes</span>
                <span className="text-sm font-medium">
                  {filteredStats.roles.recientes || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Asignaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total asignaciones</span>
                <span className="text-sm font-medium">{filteredStats.roles.asignaciones}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Promedio por rol</span>
                <span className="text-sm font-medium">
                  {(filteredStats.roles.asignaciones / Math.max(filteredStats.roles.total, 1)).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Roles sin asignar</span>
                <span className="text-sm font-medium">
                  {roles?.filter(r => !userRoles?.some(ur => ur.role_id === r.id)).length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-green-600" />
              Permisos del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Promedio permisos/rol</span>
                <span className="text-sm font-medium">
                  {roles ? (roles.reduce((acc, r) => acc + r.permisos.length, 0) / Math.max(roles.length, 1)).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Roles con todos los permisos</span>
                <span className="text-sm font-medium">
                  {roles?.filter(r => r.permisos.length >= 20).length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{hasValidFilters ? 'Total filtrado' : 'Total histórico'}</span>
                <span className="text-sm font-medium">{filteredStats.roles.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const RolesAnalytics = () => {
  return <RolesAnalyticsContent />;
};
