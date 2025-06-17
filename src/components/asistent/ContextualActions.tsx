
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSecurity } from '@/hooks/useSecurity';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Users, 
  Settings, 
  FileText, 
  BarChart3,
  Bell,
  Calendar,
  MapPin,
  Shield,
  Download
} from 'lucide-react';

interface ContextualActionsProps {
  onActionExecute: (action: string, params?: any) => void;
}

const ContextualActions: React.FC<ContextualActionsProps> = ({ onActionExecute }) => {
  const { hasPermission, isAdmin } = useSecurity();
  const { user } = useAuth();

  const actions = [
    // Acciones de reportes
    {
      id: 'create-report',
      title: 'Crear Nuevo Reporte',
      description: 'Crear un reporte rápidamente',
      icon: Plus,
      permission: 'crear_reporte',
      category: 'Reportes',
      priority: 'high',
      action: () => onActionExecute('navigate', '/nuevo-reporte')
    },
    {
      id: 'view-reports',
      title: 'Ver Todos los Reportes',
      description: 'Acceder al módulo de reportes',
      icon: FileText,
      permission: 'ver_reporte',
      category: 'Reportes',
      priority: 'medium',
      action: () => onActionExecute('navigate', '/admin/reportes')
    },
    {
      id: 'reports-map',
      title: 'Mapa de Reportes',
      description: 'Visualizar reportes en el mapa',
      icon: MapPin,
      permission: 'ver_reporte',
      category: 'Reportes',
      priority: 'medium',
      action: () => onActionExecute('navigate', '/mapa-reportes')
    },

    // Acciones de usuarios (solo para administradores)
    {
      id: 'manage-users',
      title: 'Gestionar Usuarios',
      description: 'Administrar cuentas de usuario',
      icon: Users,
      permission: 'ver_usuario',
      category: 'Administración',
      priority: 'high',
      adminOnly: true,
      action: () => onActionExecute('navigate', '/admin/usuarios')
    },
    {
      id: 'manage-roles',
      title: 'Gestionar Roles',
      description: 'Configurar roles y permisos',
      icon: Shield,
      permission: 'ver_rol',
      category: 'Administración',
      priority: 'medium',
      adminOnly: true,
      action: () => onActionExecute('navigate', '/admin/roles')
    },

    // Acciones de análisis
    {
      id: 'analytics',
      title: 'Ver Analíticas',
      description: 'Revisar métricas y estadísticas',
      icon: BarChart3,
      permission: 'ver_reporte',
      category: 'Análisis',
      priority: 'medium',
      action: () => onActionExecute('show-analytics')
    },
    {
      id: 'export-data',
      title: 'Exportar Datos',
      description: 'Descargar reportes en Excel/PDF',
      icon: Download,
      permission: 'ver_reporte',
      category: 'Análisis',
      priority: 'low',
      action: () => onActionExecute('export-data')
    },

    // Acciones personales
    {
      id: 'my-profile',
      title: 'Mi Perfil',
      description: 'Actualizar información personal',
      icon: Settings,
      permission: null, // Todos pueden acceder
      category: 'Personal',
      priority: 'low',
      action: () => onActionExecute('navigate', '/mi-perfil')
    },
    {
      id: 'notifications',
      title: 'Configurar Notificaciones',
      description: 'Personalizar alertas y recordatorios',
      icon: Bell,
      permission: null,
      category: 'Personal',
      priority: 'low',
      action: () => onActionExecute('configure-notifications')
    }
  ];

  // Filtrar acciones basadas en permisos
  const availableActions = actions.filter(action => {
    // Si requiere ser admin y el usuario no es admin
    if (action.adminOnly && !isAdmin()) {
      return false;
    }
    
    // Si requiere un permiso específico
    if (action.permission && !hasPermission(action.permission as any)) {
      return false;
    }
    
    return true;
  });

  // Agrupar acciones por categoría
  const groupedActions = availableActions.reduce((groups, action) => {
    const category = action.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(action);
    return groups;
  }, {} as Record<string, typeof availableActions>);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acciones Disponibles</CardTitle>
          <CardDescription>
            Acciones personalizadas según tus permisos y rol
          </CardDescription>
        </CardHeader>
      </Card>

      {Object.entries(groupedActions).map(([category, categoryActions]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Card 
                    key={action.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={action.action}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">{action.title}</h4>
                            <Badge className={getPriorityColor(action.priority)}>
                              {action.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                          <Button size="sm" className="w-full">
                            Ejecutar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(groupedActions).length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              No hay acciones disponibles para tu rol actual
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContextualActions;
