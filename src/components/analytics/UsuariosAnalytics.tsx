
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Activity } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { StatsCard } from '@/components/dashboard/StatsCard';

export const UsuariosAnalytics = () => {
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
          Análisis de Usuarios
        </h2>
        <p className="text-muted-foreground">
          Estadísticas detalladas sobre los usuarios del sistema
        </p>
      </div>

      {/* Estadísticas de usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Usuarios"
          value={stats.usuarios.total}
          subtitle="Usuarios registrados"
          icon={Users}
          color="text-blue-600"
        />
        
        <StatsCard
          title="Usuarios Activos"
          value={stats.usuarios.activos}
          subtitle={`${Math.round((stats.usuarios.activos / stats.usuarios.total) * 100)}% del total`}
          icon={UserCheck}
          color="text-green-600"
        />
        
        <StatsCard
          title="Usuarios Confirmados"
          value={stats.usuarios.confirmados}
          subtitle="Con email verificado"
          icon={UserCheck}
          color="text-purple-600"
        />
        
        <StatsCard
          title="Nuevos Usuarios"
          value={stats.usuarios.recientes}
          subtitle="Últimos 7 días"
          icon={UserPlus}
          color="text-orange-600"
        />
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {stats.usuarios.total > 0 
                    ? `${Math.round((stats.usuarios.activos / stats.usuarios.total) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasa de confirmación</span>
                <span className="text-sm font-medium">
                  {stats.usuarios.total > 0
                    ? `${Math.round((stats.usuarios.confirmados / stats.usuarios.total) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Crecimiento semanal</span>
                <span className="text-sm font-medium">{stats.usuarios.recientes} nuevos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usuarios totales</span>
                <span className="text-sm font-medium">{stats.usuarios.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usuarios activos</span>
                <span className="text-sm font-medium">{stats.usuarios.activos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usuarios inactivos</span>
                <span className="text-sm font-medium">{stats.usuarios.total - stats.usuarios.activos}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
