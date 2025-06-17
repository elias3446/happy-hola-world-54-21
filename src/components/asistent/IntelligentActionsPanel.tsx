
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSecurity } from '@/hooks/useSecurity';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { 
  Zap, 
  BarChart3, 
  Users, 
  FileText, 
  Shield, 
  Settings,
  Download,
  Bell,
  Plus,
  Eye,
  TrendingUp,
  User
} from 'lucide-react';

interface IntelligentActionsPanelProps {
  onActionExecute: (action: string, params?: any) => void;
}

export const IntelligentActionsPanel: React.FC<IntelligentActionsPanelProps> = ({ onActionExecute }) => {
  const { hasPermission, isAdmin } = useSecurity();
  const { user } = useAuth();
  const { data: stats } = useDashboardStats();
  const { users } = useUsers();
  const { roles } = useRoles();

  // Calculate missing statistics from available data
  const reportesPendientes = stats?.reportes?.porEstado?.find(estado => 
    estado.estado.toLowerCase().includes('pendiente') || 
    estado.estado.toLowerCase().includes('nuevo') ||
    estado.estado.toLowerCase().includes('sin estado')
  )?.count || 0;

  const quickActions = [
    {
      id: 'show-user-info',
      title: 'Mi Información',
      description: 'Ver mis datos y permisos',
      icon: User,
      permission: null,
      action: () => onActionExecute('show-user-info'),
      color: 'bg-indigo-500'
    },
    {
      id: 'create-report',
      title: 'Nuevo Reporte',
      description: 'Crear reporte rápidamente',
      icon: Plus,
      permission: 'crear_reporte',
      action: () => onActionExecute('navigate', '/nuevo-reporte'),
      color: 'bg-blue-500'
    },
    {
      id: 'view-analytics',
      title: 'Ver Análisis',
      description: 'Dashboard analítico completo',
      icon: BarChart3,
      permission: 'ver_reporte',
      action: () => onActionExecute('show-analytics'),
      color: 'bg-purple-500'
    },
    {
      id: 'manage-users',
      title: 'Gestionar Usuarios',
      description: 'Administrar cuentas',
      icon: Users,
      permission: 'ver_usuario',
      action: () => onActionExecute('navigate', '/admin/usuarios'),
      color: 'bg-green-500',
      adminOnly: true
    },
    {
      id: 'export-data',
      title: 'Exportar Datos',
      description: 'Descargar reportes',
      icon: Download,
      permission: 'ver_reporte',
      action: () => onActionExecute('export-data'),
      color: 'bg-orange-500'
    }
  ];

  const systemInsights = [
    {
      title: 'Usuario Actual',
      value: user?.email?.split('@')[0] || 'Usuario',
      color: 'text-blue-600',
      icon: User
    },
    {
      title: 'Estado del Sistema',
      value: 'Óptimo',
      color: 'text-green-600',
      icon: Zap
    },
    {
      title: 'Reportes Pendientes',
      value: reportesPendientes,
      color: 'text-yellow-600',
      icon: FileText
    },
    {
      title: 'Usuarios Activos',
      value: stats?.usuarios?.activos || 0,
      color: 'text-blue-600',
      icon: Users
    },
    {
      title: 'Total Usuarios',
      value: users?.length || 0,
      color: 'text-gray-600',
      icon: Users
    },
    {
      title: 'Roles Disponibles',
      value: roles?.length || 0,
      color: 'text-purple-600',
      icon: Shield
    }
  ];

  const contextualSuggestions = () => {
    const suggestions = [];
    
    if (reportesPendientes > 5) {
      suggestions.push({
        title: 'Revisar Reportes Pendientes',
        description: `Tienes ${reportesPendientes} reportes pendientes de revisión`,
        action: () => onActionExecute('navigate', '/admin/reportes?filter=pendientes'),
        priority: 'high'
      });
    }

    if (isAdmin() && (stats?.usuarios?.activos || 0) < (stats?.usuarios?.total || 0) * 0.7) {
      suggestions.push({
        title: 'Activar Usuarios Inactivos',
        description: 'Muchos usuarios están inactivos. Considera enviar recordatorios.',
        action: () => onActionExecute('configure-notifications'),
        priority: 'medium'
      });
    }

    if ((stats?.reportes?.total || 0) > 0) {
      suggestions.push({
        title: 'Generar Análisis Mensual',
        description: 'Crear reporte de actividad del mes',
        action: () => onActionExecute('generate-chart', { type: 'line', data: [] }),
        priority: 'low'
      });
    }

    // Sugerencia personalizada basada en el usuario
    if (user?.email) {
      suggestions.push({
        title: 'Análisis del Sistema',
        description: `Obtener análisis completo personalizado para ${user.email.split('@')[0]}`,
        action: () => onActionExecute('analyze-system'),
        priority: 'medium'
      });
    }

    return suggestions;
  };

  const availableActions = quickActions.filter(action => {
    if (action.adminOnly && !isAdmin()) return false;
    if (action.permission && !hasPermission(action.permission as any)) return false;
    return true;
  });

  const suggestions = contextualSuggestions();

  return (
    <div className="space-y-6">
      {/* Información del Usuario Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Información del Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rol:</span>
              <Badge variant={isAdmin() ? 'destructive' : 'secondary'}>
                {isAdmin() ? 'Administrador' : 'Usuario'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Permisos:</span>
              <span className="text-xs text-muted-foreground">
                {hasPermission('ver_reporte') ? 'Reportes ✓' : 'Reportes ✗'} |
                {hasPermission('crear_usuario') ? ' Usuarios ✓' : ' Usuarios ✗'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {systemInsights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{insight.title}</p>
                    <p className={`text-sm font-semibold ${insight.color}`}>
                      {insight.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acciones Rápidas</CardTitle>
          <CardDescription>Acciones personalizadas según tus permisos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {availableActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  onClick={action.action}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-20 p-3"
                >
                  <div className={`p-2 rounded-md ${action.color} text-white`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sugerencias Contextuales */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sugerencias Inteligentes</CardTitle>
            <CardDescription>Recomendaciones basadas en el estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={suggestion.action}
                >
                  <div>
                    <p className="text-sm font-medium">{suggestion.title}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                  </div>
                  <Badge variant={
                    suggestion.priority === 'high' ? 'destructive' :
                    suggestion.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {suggestion.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntelligentActionsPanel;
