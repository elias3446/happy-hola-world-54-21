

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
import { useUserRoles } from '@/hooks/useUserRoles';
import { useRoles } from '@/hooks/useRoles';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const UsuariosAnalyticsContent = () => {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  // Include current user in analytics
  const { users } = useUsers(true);
  const { userRoles } = useUserRoles();
  const { roles } = useRoles();
  const { user: currentUser } = useAuth();
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
      case 'prioridad': // roles
        return filters.priority.length > 0;
      case 'estados': // activación
        return filters.estados.length > 0;
      case 'categorias': // confirmación
        return filters.categorias.length > 0;
      default:
        return false;
    }
  };

  const hasValidFilters = appliedFilters && isValidForComparison(appliedFilters);

  const getFilteredStats = () => {
    // Always return stats from database - no simulation or mock data
    if (!stats || !users) return null;
    
    if (!hasValidFilters) {
      console.log('Sin filtros válidos - mostrando datos reales de la base de datos incluyendo usuario actual');
      return stats;
    }

    console.log('Aplicando filtros de comparación sobre datos reales (incluyendo usuario actual):', {
      totalUsuarios: stats.usuarios.total,
      usuariosCompletos: users.length,
      filtros: appliedFilters,
      tabActiva: appliedFilters.activeTab,
      usuarioActual: currentUser?.id
    });

    // Use only real database data - filter the actual users array (including current user)
    let filteredUsers = [...users];
    console.log('Usuarios reales iniciales (incluyendo usuario actual):', filteredUsers.length);

    switch (appliedFilters.activeTab) {
      case 'busqueda':
        if (appliedFilters.searchTerm.length >= 2) {
          const userIds = [...appliedFilters.searchTerm];
          
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

      case 'prioridad': // roles
        if (appliedFilters.priority.length > 0) {
          const selectedRoleNames = appliedFilters.priority;
          console.log('Roles seleccionados:', selectedRoleNames);
          console.log('UserRoles disponibles:', userRoles);
          console.log('Roles disponibles:', roles);
          console.log('Usuario actual:', currentUser?.id);
          
          // Obtener los IDs de los roles seleccionados
          const selectedRoleIds = roles?.filter(role => 
            selectedRoleNames.includes(role.nombre)
          ).map(role => role.id) || [];
          
          console.log('IDs de roles seleccionados:', selectedRoleIds);
          
          // Obtener los IDs de usuarios que tienen alguno de los roles seleccionados
          const userIdsWithSelectedRoles = userRoles?.filter(userRole => 
            selectedRoleIds.includes(userRole.role_id) && !userRole.deleted_at
          ).map(userRole => userRole.user_id) || [];
          
          console.log('IDs de usuarios con roles seleccionados:', userIdsWithSelectedRoles);
          
          // Filtrar usuarios que tienen alguno de los roles seleccionados
          filteredUsers = filteredUsers.filter(user => {
            // Verificar en user_roles table
            const hasRoleInTable = userIdsWithSelectedRoles.includes(user.id);
            
            // Verificar en el campo role del perfil
            const hasRoleInProfile = user.role && Array.isArray(user.role) && 
              selectedRoleNames.some(roleName => user.role.includes(roleName));
            
            return hasRoleInTable || hasRoleInProfile;
          });
          
          console.log(`Filtro de roles aplicado: ${filteredUsers.length} usuarios con roles seleccionados`);
          console.log('Usuarios encontrados con roles:', filteredUsers.map(u => ({ id: u.id, email: u.email })));
        }
        break;

      case 'estados': // activación
        if (appliedFilters.estados.length > 0) {
          filteredUsers = filteredUsers.filter(user => {
            const isActive = user.asset;
            const userState = isActive ? 'Activo' : 'Inactivo';
            return appliedFilters.estados.includes(userState);
          });
          console.log(`Filtro de activación aplicado: ${filteredUsers.length} usuarios con estados seleccionados`);
        }
        break;

      case 'categorias': // confirmación
        if (appliedFilters.categorias.length > 0) {
          filteredUsers = filteredUsers.filter(user => {
            const isConfirmed = user.confirmed;
            const userConfirmation = isConfirmed ? 'Confirmado' : 'No Confirmado';
            return appliedFilters.categorias.includes(userConfirmation);
          });
          console.log(`Filtro de confirmación aplicado: ${filteredUsers.length} usuarios con confirmaciones seleccionadas`);
        }
        break;
    }

    console.log('Resultado final del filtrado sobre datos reales (incluyendo usuario actual):', {
      usuariosOriginales: stats.usuarios.total,
      usuariosFiltrados: filteredUsers.length,
      tabActiva: appliedFilters.activeTab,
      incluyeUsuarioActual: currentUser?.id ? filteredUsers.some(u => u.id === currentUser.id) : false
    });

    // Recalculate statistics based on real filtered data only
    const totalFiltrado = filteredUsers.length;
    const activosFiltrado = filteredUsers.filter(u => u.asset === true).length;
    const confirmadosFiltrado = filteredUsers.filter(u => u.confirmed === true).length;
    
    // Calculate recent users (last 7 days) from real filtered data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recientesFiltrado = filteredUsers.filter(u => 
      new Date(u.created_at) >= sevenDaysAgo
    ).length;

    // Recalculate groupings based on real data only
    const porEstadoActivacion = [
      { estado: 'Activos', count: activosFiltrado, color: '#10B981' },
      { estado: 'Inactivos', count: totalFiltrado - activosFiltrado, color: '#EF4444' }
    ];

    const porConfirmacion = [
      { categoria: 'Confirmados', count: confirmadosFiltrado, color: '#3B82F6' },
      { categoria: 'No confirmados', count: totalFiltrado - confirmadosFiltrado, color: '#F59E0B' }
    ];

    // Calculate roles and user types distribution
    const porRoles = [];
    const porTipoUsuario = { admin: 0, user: 0, ambas: 0 };

    // Group users by roles from user_roles table
    const rolesCounts = {};
    filteredUsers.forEach(user => {
      const userRoleAssignments = userRoles?.filter(ur => 
        ur.user_id === user.id && !ur.deleted_at
      ) || [];
      
      const userRoleNames = userRoleAssignments.map(ur => {
        const role = roles?.find(r => r.id === ur.role_id);
        return role ? role.nombre : null;
      }).filter(Boolean);

      // Count for roles chart
      userRoleNames.forEach(roleName => {
        rolesCounts[roleName] = (rolesCounts[roleName] || 0) + 1;
      });

      // Count for user types (admin, user, both)
      const hasAdmin = userRoleNames.some(r => r.toLowerCase().includes('admin')) || 
                      (user.role && user.role.some(r => r.toLowerCase().includes('admin')));
      const hasUser = userRoleNames.some(r => r.toLowerCase().includes('user')) || 
                     (user.role && user.role.some(r => r.toLowerCase().includes('user')));

      if (hasAdmin && hasUser) {
        porTipoUsuario.ambas++;
      } else if (hasAdmin) {
        porTipoUsuario.admin++;
      } else if (hasUser) {
        porTipoUsuario.user++;
      }
    });

    // Convert roles count to chart format
    Object.entries(rolesCounts).forEach(([roleName, count], index) => {
      const role = roles?.find(r => r.nombre === roleName);
      porRoles.push({
        name: roleName,
        value: count,
        color: role?.color || `hsl(${index * 45}, 70%, 60%)`
      });
    });

    // Convert user types to chart format
    const porTipoUsuarioChart = [
      { name: 'Solo Admin', value: porTipoUsuario.admin, color: '#DC2626' },
      { name: 'Solo Usuario', value: porTipoUsuario.user, color: '#059669' },
      { name: 'Admin y Usuario', value: porTipoUsuario.ambas, color: '#7C3AED' }
    ].filter(item => item.value > 0);

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
        porRoles,
        porTipoUsuario: porTipoUsuarioChart,
        datosCompletos: filteredUsers, // Real filtered data only
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {hasValidFilters ? 'Análisis Comparativo de Usuarios (Datos Reales)' : 'Análisis de Usuarios en Tiempo Real (Datos Reales)'}
          </h2>
          <p className="text-muted-foreground">
            {hasValidFilters 
              ? 'Dashboard con filtros aplicados sobre datos reales de la base de datos (incluyendo usuario actual)'
              : 'Dashboard en tiempo real con datos reales de la base de datos (incluyendo usuario actual)'
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
          <h3 className="text-sm font-medium text-blue-900 mb-2">Comparación activa sobre datos reales (incluyendo usuario actual):</h3>
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
              <span className="bg-blue-100 px-2 py-1 rounded">
                Roles: {appliedFilters.priority.join(', ')}
              </span>
            )}
            {appliedFilters.activeTab === 'estados' && appliedFilters.estados.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Activación: {appliedFilters.estados.join(', ')}
              </span>
            )}
            {appliedFilters.activeTab === 'categorias' && appliedFilters.categorias.length > 0 && (
              <span className="bg-blue-100 px-2 py-1 rounded">
                Confirmación: {appliedFilters.categorias.join(', ')}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-blue-600">
            Datos reales: {filteredStats.usuarios.total} de {stats?.usuarios.total} usuarios (incluyendo usuario actual)
          </div>
        </div>
      )}

      {/* Indicador de vista en tiempo real */}
      {!hasValidFilters && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Vista en Tiempo Real (Datos Reales):</h3>
          <div className="text-sm text-green-700">
            Mostrando todos los usuarios reales de la base de datos ({stats?.usuarios.total} usuarios, incluyendo usuario actual)
          </div>
        </div>
      )}

      {/* Métricas en Tiempo Real - Solo datos reales, sin gráficos de barras y SIN comparaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RealTimeMetrics
          title="Total Usuarios"
          value={filteredStats.usuarios.total}
          subtitle={`${filteredStats.usuarios.activos} activos`}
          icon={Users}
          color="text-blue-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
          showSparkline={false}
        />
        
        <RealTimeMetrics
          title="Usuarios Activos"
          value={filteredStats.usuarios.activos}
          subtitle={`${Math.round((filteredStats.usuarios.activos / Math.max(filteredStats.usuarios.total, 1)) * 100)}% del total`}
          icon={UserCheck}
          color="text-green-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
          showSparkline={false}
        />
        
        <RealTimeMetrics
          title="Usuarios Confirmados"
          value={filteredStats.usuarios.confirmados}
          subtitle="Con email verificado"
          icon={Shield}
          color="text-purple-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
          showSparkline={false}
        />
        
        <RealTimeMetrics
          title="Nuevos Usuarios"
          value={filteredStats.usuarios.recientes}
          subtitle="Últimos 7 días"
          icon={UserPlus}
          color="text-orange-600"
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })}
          showHourlyChart={false}
          showSparkline={false}
        />
      </div>

      {/* Gráficos Interactivos - Solo datos reales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveCharts
          title="Distribución por Estado de Activación"
          description={hasValidFilters ? "Usuarios filtrados según su estado de activación (datos reales, incluyendo usuario actual)" : "Todos los usuarios según su estado de activación (datos reales, incluyendo usuario actual)"}
          data={filteredStats.usuarios.porEstadoActivacion.map(item => ({
            name: item.estado,
            value: item.count,
            color: item.color,
          }))}
        />
        
        <InteractiveCharts
          title="Distribución por Confirmación de Email"
          description={hasValidFilters ? "Usuarios filtrados según su confirmación de email (datos reales, incluyendo usuario actual)" : "Todos los usuarios según su confirmación de email (datos reales, incluyendo usuario actual)"}
          data={filteredStats.usuarios.porConfirmacion.map(item => ({
            name: item.categoria,
            value: item.count,
            color: item.color,
          }))}
        />
      </div>

      {/* Nuevos Gráficos de Roles y Tipos de Usuario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStats.usuarios.porRoles && filteredStats.usuarios.porRoles.length > 0 && (
          <InteractiveCharts
            title="Distribución por Roles"
            description={hasValidFilters ? "Usuarios filtrados distribuidos por roles asignados (datos reales, incluyendo usuario actual)" : "Todos los usuarios distribuidos por roles asignados (datos reales, incluyendo usuario actual)"}
            data={filteredStats.usuarios.porRoles}
          />
        )}
        
        {filteredStats.usuarios.porTipoUsuario && filteredStats.usuarios.porTipoUsuario.length > 0 && (
          <InteractiveCharts
            title="Distribución por Tipo de Usuario"
            description={hasValidFilters ? "Usuarios filtrados según tipo: solo admin, solo usuario, o ambos (datos reales, incluyendo usuario actual)" : "Todos los usuarios según tipo: solo admin, solo usuario, o ambos (datos reales, incluyendo usuario actual)"}
            data={filteredStats.usuarios.porTipoUsuario}
          />
        )}
      </div>

      {/* Análisis detallado - Solo datos reales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Análisis de Activación (Datos Reales)
            </CardTitle>
            <CardDescription>
              {hasValidFilters ? "Métricas de activación en usuarios filtrados (datos reales, incluyendo usuario actual)" : "Métricas detalladas de activación basadas en datos reales de la base de datos (incluyendo usuario actual)"}
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
                      {Math.round((filteredStats.usuarios.activos / Math.max(filteredStats.usuarios.total, 1)) * 100)}% del total real
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
                      {Math.round(((filteredStats.usuarios.total - filteredStats.usuarios.activos) / Math.max(filteredStats.usuarios.total, 1)) * 100)}% del total real
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
              Análisis de Confirmación (Datos Reales)
            </CardTitle>
            <CardDescription>
              {hasValidFilters ? "Métricas de confirmación en usuarios filtrados (datos reales, incluyendo usuario actual)" : "Métricas detalladas de confirmación de email basadas en datos reales de la base de datos (incluyendo usuario actual)"}
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
                      {Math.round((filteredStats.usuarios.confirmados / Math.max(filteredStats.usuarios.total, 1)) * 100)}% del total real
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
                      {Math.round(((filteredStats.usuarios.total - filteredStats.usuarios.confirmados) / Math.max(filteredStats.usuarios.total, 1)) * 100)}% del total real
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

      {/* Métricas adicionales - Solo datos reales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Resumen de Actividad (Datos Reales)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasa de activación real</span>
                <span className="text-sm font-medium">
                  {Math.round((filteredStats.usuarios.activos / Math.max(filteredStats.usuarios.total, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasa de confirmación real</span>
                <span className="text-sm font-medium">
                  {Math.round((filteredStats.usuarios.confirmados / Math.max(filteredStats.usuarios.total, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usuarios recientes (BD)</span>
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
              Distribución Temporal (Datos Reales)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Esta semana (BD)</span>
                <span className="text-sm font-medium">{filteredStats.usuarios.recientes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Promedio diario real</span>
                <span className="text-sm font-medium">
                  {Math.round(filteredStats.usuarios.recientes / 7)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{hasValidFilters ? 'Total filtrado (BD)' : 'Total histórico (BD)'}</span>
                <span className="text-sm font-medium">{filteredStats.usuarios.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              Eficiencia del Sistema (Datos Reales)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usuarios por rol (BD)</span>
                <span className="text-sm font-medium">
                  {(filteredStats.usuarios.total / Math.max(stats?.roles.total || 1, 1)).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Asignaciones activas (BD)</span>
                <span className="text-sm font-medium">
                  {stats?.roles.asignaciones || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Roles activos (BD)</span>
                <span className="text-sm font-medium">
                  {Math.round(((stats?.roles.activos || 0) / Math.max(stats?.roles.total || 1, 1)) * 100)}%
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

