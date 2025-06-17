
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/hooks/useAuth';
import { useReportes } from '@/hooks/useReportes';
import { useSecurity } from '@/hooks/useSecurity';
import { 
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Calendar,
  Target,
  TrendingUp,
  User,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: Date;
  action?: () => void;
  actionLabel?: string;
  read: boolean;
  category: string;
  icon: React.ComponentType<any>;
}

const SmartNotifications: React.FC = () => {
  const { user } = useAuth();
  const { reportes = [] } = useReportes();
  const { hasPermission, isAdmin } = useSecurity();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState({
    urgentReports: true,
    pendingReports: true,
    assignments: true,
    deadlines: true,
    systemUpdates: true,
    weeklyDigest: true
  });

  // Generar notificaciones inteligentes
  useEffect(() => {
    if (user && reportes.length > 0) {
      generateSmartNotifications();
    }
  }, [user, reportes, settings]);

  const generateSmartNotifications = () => {
    const newNotifications: Notification[] = [];
    const now = new Date();

    // Reportes urgentes
    if (settings.urgentReports) {
      const urgentReports = reportes.filter(r => r.priority === 'urgente');
      if (urgentReports.length > 0) {
        newNotifications.push({
          id: 'urgent-reports',
          type: 'urgent',
          title: 'Reportes Urgentes Detectados',
          description: `${urgentReports.length} reportes requieren atención inmediata`,
          timestamp: now,
          category: 'Reportes',
          icon: AlertTriangle,
          read: false,
          action: () => console.log('Ver reportes urgentes'),
          actionLabel: 'Ver Reportes'
        });
      }
    }

    // Reportes pendientes hace más de 48 horas
    if (settings.pendingReports) {
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const oldPendingReports = reportes.filter(r => 
        r.estado?.nombre?.toLowerCase() === 'pendiente' && 
        new Date(r.created_at) < twoDaysAgo
      );
      
      if (oldPendingReports.length > 0) {
        newNotifications.push({
          id: 'old-pending',
          type: 'warning',
          title: 'Reportes Pendientes Antiguos',
          description: `${oldPendingReports.length} reportes llevan más de 48 horas pendientes`,
          timestamp: now,
          category: 'Reportes',
          icon: Clock,
          read: false,
          action: () => console.log('Ver reportes pendientes antiguos'),
          actionLabel: 'Revisar'
        });
      }
    }

    // Mis asignaciones recientes
    if (settings.assignments) {
      const myRecentAssignments = reportes.filter(r => 
        r.assigned_to === user?.id && 
        new Date(r.updated_at) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
      );
      
      if (myRecentAssignments.length > 0) {
        newNotifications.push({
          id: 'my-assignments',
          type: 'info',
          title: 'Nuevas Asignaciones',
          description: `Tienes ${myRecentAssignments.length} nuevos reportes asignados`,
          timestamp: now,
          category: 'Asignaciones',
          icon: Target,
          read: false,
          action: () => console.log('Ver mis asignaciones'),
          actionLabel: 'Ver Asignaciones'
        });
      }
    }

    // Análisis de productividad semanal
    if (settings.weeklyDigest && isAdmin()) {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weeklyReports = reportes.filter(r => new Date(r.created_at) >= weekAgo);
      const completedThisWeek = weeklyReports.filter(r => r.estado?.nombre?.toLowerCase() === 'completado').length;
      
      if (weeklyReports.length > 0) {
        const completionRate = (completedThisWeek / weeklyReports.length) * 100;
        newNotifications.push({
          id: 'weekly-digest',
          type: completionRate >= 80 ? 'success' : completionRate >= 60 ? 'warning' : 'urgent',
          title: 'Resumen Semanal',
          description: `${weeklyReports.length} reportes esta semana, ${Math.round(completionRate)}% completados`,
          timestamp: now,
          category: 'Analytics',
          icon: TrendingUp,
          read: false,
          action: () => console.log('Ver analytics'),
          actionLabel: 'Ver Detalles'
        });
      }
    }

    // Reportes sin asignar (solo para admins)
    if (isAdmin() && hasPermission('editar_reporte')) {
      const unassignedReports = reportes.filter(r => !r.assigned_to);
      if (unassignedReports.length > 0) {
        newNotifications.push({
          id: 'unassigned-reports',
          type: 'warning',
          title: 'Reportes Sin Asignar',
          description: `${unassignedReports.length} reportes esperan ser asignados`,
          timestamp: now,
          category: 'Administración',
          icon: User,
          read: false,
          action: () => console.log('Asignar reportes'),
          actionLabel: 'Asignar'
        });
      }
    }

    // Notificación de bienvenida si no hay otras
    if (newNotifications.length === 0) {
      newNotifications.push({
        id: 'welcome',
        type: 'info',
        title: 'Todo al día',
        description: 'No hay notificaciones urgentes en este momento',
        timestamp: now,
        category: 'Sistema',
        icon: CheckCircle,
        read: false
      });
    }

    setNotifications(newNotifications);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'success': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header con configuración */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones Inteligentes
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Alertas y recordatorios personalizados según tu actividad
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="urgentReports"
                checked={settings.urgentReports}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, urgentReports: checked }))
                }
              />
              <Label htmlFor="urgentReports" className="text-sm">
                Reportes urgentes
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="pendingReports"
                checked={settings.pendingReports}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, pendingReports: checked }))
                }
              />
              <Label htmlFor="pendingReports" className="text-sm">
                Reportes pendientes
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="assignments"
                checked={settings.assignments}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, assignments: checked }))
                }
              />
              <Label htmlFor="assignments" className="text-sm">
                Nuevas asignaciones
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="deadlines"
                checked={settings.deadlines}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, deadlines: checked }))
                }
              />
              <Label htmlFor="deadlines" className="text-sm">
                Plazos vencidos
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="weeklyDigest"
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, weeklyDigest: checked }))
                }
              />
              <Label htmlFor="weeklyDigest" className="text-sm">
                Resumen semanal
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="systemUpdates"
                checked={settings.systemUpdates}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, systemUpdates: checked }))
                }
              />
              <Label htmlFor="systemUpdates" className="text-sm">
                Actualizaciones
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Activas</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {notifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <Card 
                    key={notification.id}
                    className={`transition-all cursor-pointer ${
                      notification.read ? 'opacity-60' : ''
                    } ${getNotificationColor(notification.type)}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'urgent' ? 'bg-red-100' :
                          notification.type === 'warning' ? 'bg-yellow-100' :
                          notification.type === 'success' ? 'bg-green-100' :
                          'bg-blue-100'
                        }`}>
                          <IconComponent className={`h-4 w-4 ${getIconColor(notification.type)}`} />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {notification.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(notification.timestamp, { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                            
                            {notification.action && notification.actionLabel && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.action!();
                                }}
                              >
                                {notification.actionLabel}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartNotifications;
