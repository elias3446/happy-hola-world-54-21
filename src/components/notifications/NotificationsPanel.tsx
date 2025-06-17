
import React from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification, NotificationType } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'reporte_asignado':
    case 'reporte_reasignado':
      return '📋';
    case 'reporte_desasignado':
      return '❌';
    case 'perfil_actualizado':
      return '👤';
    case 'reporte_eliminado':
      return '🗑️';
    case 'usuario_eliminado':
      return '👥';
    case 'rol_eliminado':
      return '🛡️';
    case 'categoria_eliminada':
      return '📁';
    case 'estado_eliminado':
      return '⚡';
    default:
      return '📢';
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'reporte_asignado':
    case 'reporte_reasignado':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'reporte_desasignado':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'perfil_actualizado':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'reporte_eliminado':
    case 'usuario_eliminado':
    case 'rol_eliminado':
    case 'categoria_eliminada':
    case 'estado_eliminado':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingAsRead: boolean;
  isDeleting: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  isMarkingAsRead,
  isDeleting,
}) => {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div className={`p-3 rounded-lg border transition-colors ${
      notification.read 
        ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' 
        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-lg">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium truncate ${
                notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {notification.title}
              </h4>
              <p className={`text-xs mt-1 ${
                notification.read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {notification.message}
              </p>
            </div>
            
            <Badge variant="outline" className={`text-xs ${getNotificationColor(notification.type)}`}>
              {notification.type.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{timeAgo}</span>
            
            <div className="flex items-center gap-1">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onMarkAsRead(notification.id)}
                  disabled={isMarkingAsRead}
                  title="Marcar como leída"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={() => onDelete(notification.id)}
                disabled={isDeleting}
                title="Eliminar notificación"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationsPanel: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeleting,
  } = useNotifications();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Cargando notificaciones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No tienes notificaciones</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    isMarkingAsRead={isMarkingAsRead}
                    isDeleting={isDeleting}
                  />
                  {index < notifications.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
