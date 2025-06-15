
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Settings, Activity, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRoles } from '@/hooks/useRoles';
import { useUsers } from '@/hooks/useUsers';
import { RealTimeMetrics } from './RealTimeMetrics';
import { InteractiveCharts } from './InteractiveCharts';
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel';
import { ActivityPeakChart } from './ActivityPeakChart';
import { AdvancedFilters } from '@/hooks/useAdvancedFilters';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { StatsCard } from '@/components/dashboard/StatsCard';

const RolesAnalyticsContent = () => {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { roles } = useRoles();
  const { users } = useUsers(true); // Incluir usuario actual
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
    
    // Actualizar los IDs seleccionados cuando cambien los filtros de búsqueda
    if (filters.searchTerm && filters.searchTerm.length > 0) {
      setSelectedUserIds(filters.searchTerm);
    } else if (filters.searchTerm.length === 0 && selectedUserIds.length > 0) {
      setSelectedUserIds([]);
    }
    
    console.log('Filtros aplicados en Roles:', filters);
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
      case 'prioridad':
        return filters.priority.length > 0; // Roles
      case 'estados':
        return filters.estados.length > 0; // Activación
      case 'categorias':
        return filters.categorias.length > 0; // Confirmación
      default:
        return false;
    }
  };

  const hasValidFilters = appliedFilters && isValidForComparison(appliedFilters);

  const getFilteredStats = () => {
    if (!stats || !users) return stats;
    
    if (!hasValidFilters) {
      console.log('Sin filtros válidos - mostrando datos en tiempo real para roles');
      return stats;
    }

    console.log('Aplicando filtros de comparación para roles:', {
      totalUsuarios: users.length,
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
            isDateInRange(user.created_at || new Date().toISOString(), appliedFilters.dateRange!)
          );
          console.log(`Filtro de fecha aplicado: ${filteredUsers.length} usuarios en el rango`);
        }
        break;

      case 'prioridad':
        if (appliedFilters.priority.length > 0) {
          filteredUsers = filteredUsers.filter(user => 
            user.role && appliedFilters.priority.includes(user.role)
          );
          console.log(`Filtro de rol aplicado: ${filteredUsers.length} usuarios`);
        }
        break;

      case 'estados':
        if (appliedFilters.estados.length > 0) {
          filteredUsers = filteredUsers.filter(user => {
            const estado = user.asset ? 'Activo' : 'Inactivo';
            return appliedFilters.estados.includes(estado);
          });
          console.log(`Filtro de activación aplicado: ${filteredUsers.length} usuarios`);
        }
        break;

      case 'categorias':
        if (appliedFilters.categorias.length > 0) {
          filteredUsers = filteredUsers.filter(user => {
            const confirmacion = user.confirmed ? 'Confirmado' : 'No Confirmado';
            return appliedFilters.categorias.includes(confirmacion);
          });
          console.log(`Filtro de confirmación aplicado: ${filteredUsers.length} usuarios`);
        }
        break;
    }

    // Recalcular estadísticas basadas en datos filtrados
    const totalFiltrado = filteredUsers.length;
    const activosFiltrado = filteredUsers.filter(u => u.asset).length;
    const confirmadosFiltrado = filteredUsers.filter(u => u.confirmed).length;
    
    // Calcular usuarios recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recientesFiltrado = filteredUsers.filter(u => 
      new Date(u.created_at || new Date()) >= sevenDaysAgo
    ).length;

    // Re-agrupar por roles basado en datos filtrados
    const porRolesFiltrado = filteredUsers.reduce((acc, user) => {
      const roleName = user.role || 'Sin rol';
      const existing = acc.find(item => item.role === roleName);
      if (existing) {
        existing.count++;
      } else {
        const roleData = roles?.find(r => r.nombre === roleName);
        acc.push({ 
          role: roleName, 
          count: 1, 
          color: roleData?.color || '#6B7280' 
        });
      }
      return acc;
    }, [] as { role: string; count: number; color: string }[]);

    // Re-agrupar por estado de activación
    const porActivacionFiltrado = [
      { 
        estado: 'Activo', 
        count: filteredUsers.filter(u => u.asset).length, 
        color: '#10B981' 
      },
      { 
        estado: 'Inactivo', 
        count: filteredUsers.filter(u => !u.asset).length, 
        color: '#EF4444' 
      }
    ].filter(item => item.count > 0);

    // Re-agrupar por confirmación
    const porConfirmacionFiltrado = [
      { 
        confirmacion: 'Confirmado', 
        count: filteredUsers.filter(u => u.confirmed).length, 
        color: '#10B981' 
      },
      { 
        confirmacion: 'No Confirmado', 
        count: filteredUsers.filter(u => !u.confirmed).length, 
        color: '#EF4444' 
      }
    ].filter(item => item.count > 0);

    return {
      ...stats,
      usuarios: {
        ...stats.usuarios,
        total: totalFiltrado,
        activos: activosFiltrado,
        confirmados: confirmadosFiltrado,
        recientes: recientesFiltrado,
        porRoles: porRolesFiltrado,
        porActivacion: porActivacionFiltrado,
        porConfirmacion: porConfirmacionFiltrado,
        datosCompletos: filteredUsers,
      }
    };
  };

  const filteredStats = getFilteredStats();

  // Preparar datos para comparación múltiple de usuarios
  const usuariosParaComparacion = selectedUserIds.length > 0 && users ? 
    users
      .filter(u => selectedUserIds.includes(u.id))
      .map(u => ({
        id: u.id,
        nombre: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
        email: u.email,
        role: u.role || 'Sin rol',
        activo: u.asset,
        confirmado: u.confirmed,
        fechaCreacion: u.created_at
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
            {hasValidFilters ? 'Análisis Comparativo de Roles' : 'Análisis de Roles en Tiempo Real'}
          </h2>
          <p className="text-muted-foreground">
            {hasValidFilters 
              ? 'Dashboard interactivo con filtros de comparación aplicados'
              : 'Dashboard en tiempo real mostrando todos los roles y usuarios del sistema'
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
        context="usuarios"
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
            {appliedFilters.activeTab === 'prioridad' && appliedFilters.priority.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">Roles: {appliedFilters.priority.join(', ')}</span>
            )}
            {appliedFilters.activeTab === 'estados' && appliedFilters.estados.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">Activación: {appliedFilters.estados.join(', ')}</span>
            )}
            {appliedFilters.activeTab === 'categorias' && appliedFilters.categorias.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">Confirmación: {appliedFilters.categorias.join(', ')}</span>
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
            Mostrando todos los usuarios y roles del sistema ({stats?.usuarios.total} usuarios)
          </div>
        </div>
      )}

      {/* Métricas en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RealTimeMetrics
          title="Total Usuarios"
          value={filteredStats.usuarios.total}
          subtitle={`${filteredStats.usuarios.activos} activos`}
          icon={Users}
          color="text-blue-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
        />
        
        <RealTimeMetrics
          title="Usuarios Activos"
          value={filteredStats.usuarios.activos}
          subtitle={`${Math.round((filteredStats.usuarios.activos / Math.max(filteredStats.usuarios.total, 1)) * 100)}% del total`}
          icon={TrendingUp}
          color="text-green-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
        />
        
        <RealTimeMetrics
          title="Usuarios Recientes"
          value={filteredStats.usuarios.recientes}
          subtitle="Últimos 7 días"
          icon={Activity}
          color="text-orange-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
        />
        
        <RealTimeMetrics
          title="Total Roles"
          value={filteredStats.roles.total}
          subtitle={`${filteredStats.roles.activos} activos`}
          icon={Shield}
          color="text-purple-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
        />
      </div>

      {/* Gráfico de Pico de Actividad - Componente separado */}
      <ActivityPeakChart
        data={filteredStats.usuarios.datosCompletos || []}
        title={hasValidFilters ? "Pico de Actividad - Usuarios Filtrados" : "Pico de Actividad - Todos los Usuarios"}
        subtitle={hasValidFilters 
          ? `Distribución horaria de ${filteredStats.usuarios.total} usuarios filtrados`
          : `Distribución horaria de todos los usuarios (${filteredStats.usuarios.total} total)`
        }
        color="#8b5cf6"
      />

      {/* Gráficos Interactivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStats.usuarios.porRoles && filteredStats.usuarios.porRoles.length > 0 && (
          <InteractiveCharts
            title="Distribución por Roles"
            description={hasValidFilters ? "Usuarios filtrados clasificados según su rol" : "Todos los usuarios clasificados según su rol"}
            data={filteredStats.usuarios.porRoles.map(item => ({
              name: item.role,
              value: item.count,
              color: item.color,
            }))}
          />
        )}
        
        {filteredStats.usuarios.porActivacion && filteredStats.usuarios.porActivacion.length > 0 && (
          <InteractiveCharts
            title="Distribución por Activación"
            description={hasValidFilters ? "Usuarios filtrados clasificados según su estado de activación" : "Todos los usuarios clasificados según su estado de activación"}
            data={filteredStats.usuarios.porActivacion.map(item => ({
              name: item.estado,
              value: item.count,
              color: item.color,
            }))}
          />
        )}
      </div>

      {filteredStats.usuarios.porConfirmacion && filteredStats.usuarios.porConfirmacion.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InteractiveCharts
            title="Distribución por Confirmación"
            description={hasValidFilters ? "Usuarios filtrados clasificados según su estado de confirmación" : "Todos los usuarios clasificados según su estado de confirmación"}
            data={filteredStats.usuarios.porConfirmacion.map(item => ({
              name: item.confirmacion,
              value: item.count,
              color: item.color,
            }))}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Análisis de Roles
              </CardTitle>
              <CardDescription>
                {hasValidFilters ? "Métricas de roles en usuarios filtrados" : "Métricas detalladas por roles basadas en datos reales"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStats.usuarios.porRoles?.map((item) => {
                  const percentage = Math.round((item.count / Math.max(filteredStats.usuarios.total, 1)) * 100);
                  
                  return (
                    <div key={item.role} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <span className="font-medium">{item.role}</span>
                          <div className="text-xs text-muted-foreground">
                            {percentage}% del total
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{item.count}</div>
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
              <Users className="h-4 w-4 text-blue-600" />
              Resumen de Usuarios
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
                <span className="text-sm text-muted-foreground">Usuarios confirmados</span>
                <span className="text-sm font-medium text-green-600">
                  {filteredStats.usuarios.confirmados}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usuarios recientes</span>
                <span className="text-sm font-medium">
                  {filteredStats.usuarios.recientes}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              Gestión de Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total roles</span>
                <span className="text-sm font-medium">{filteredStats.roles.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Roles activos</span>
                <span className="text-sm font-medium">
                  {filteredStats.roles.activos}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Asignaciones</span>
                <span className="text-sm font-medium">{filteredStats.roles.asignaciones}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
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
                <span className="text-sm text-muted-foreground">Tasa confirmación</span>
                <span className="text-sm font-medium">
                  {Math.round((filteredStats.usuarios.confirmados / Math.max(filteredStats.usuarios.total, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{hasValidFilters ? 'Total filtrado' : 'Total histórico'}</span>
                <span className="text-sm font-medium">{filteredStats.usuarios.total}</span>
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
