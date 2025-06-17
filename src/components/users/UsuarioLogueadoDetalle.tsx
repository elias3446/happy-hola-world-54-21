
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit,
  X,
  Settings,
  Bell,
  FileText,
  BarChart3,
  Activity,
  History,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UsuarioLogueadoEdit } from './UsuarioLogueadoEdit';
import { UsuarioPasswordEdit } from './UsuarioPasswordEdit';
import { UserReportesAsignados } from './UserReportesAsignados';
import { UsuarioEstadisticasActividad } from './UsuarioEstadisticasActividad';
import { UsuarioAuditoria } from './UsuarioAuditoria';
import { UsuarioCambiosRecibidos } from './UsuarioCambiosRecibidos';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface UsuarioLogueadoDetalleProps {
  onClose?: () => void;
}

export const UsuarioLogueadoDetalle: React.FC<UsuarioLogueadoDetalleProps> = ({ onClose }) => {
  const { user, profile } = useAuth();
  const [editMode, setEditMode] = useState<'none' | 'profile' | 'password'>('none');

  if (!user || !profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No hay información del usuario disponible</p>
        </CardContent>
      </Card>
    );
  }

  const userCreatedAt = new Date(profile.created_at);
  const timeAgo = formatDistanceToNow(userCreatedAt, { addSuffix: true, locale: es });

  if (editMode === 'profile') {
    return <UsuarioLogueadoEdit onBack={() => setEditMode('none')} onClose={() => setEditMode('none')} />;
  }

  if (editMode === 'password') {
    return <UsuarioPasswordEdit onBack={() => setEditMode('none')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Mi Perfil
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode('profile')}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Perfil
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Información básica */}
            <div className="flex items-start gap-4">
              {profile.avatar && (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="space-y-2 flex-1">
                <div>
                  <h2 className="text-xl font-semibold">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {profile.role.map((role: string) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Miembro desde {timeAgo}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={profile.asset ? "default" : "secondary"}>
                    {profile.asset ? "Activo" : "Inactivo"}
                  </Badge>
                  {profile.confirmed && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Email confirmado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs con contenido */}
      <Tabs defaultValue="reportes" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="reportes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Reportes</span>
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Estadísticas</span>
          </TabsTrigger>
          <TabsTrigger value="actividad" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Actividad</span>
          </TabsTrigger>
          <TabsTrigger value="cambios" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Cambios</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="configuracion" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuración</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reportes" className="mt-6">
          <UserReportesAsignados userId={profile.id} userName={`${profile.first_name} ${profile.last_name}`} />
        </TabsContent>

        <TabsContent value="estadisticas" className="mt-6">
          <UsuarioEstadisticasActividad usuarioId={profile.id} usuarioEmail={profile.email} />
        </TabsContent>

        <TabsContent value="actividad" className="mt-6">
          <UsuarioAuditoria usuarioId={profile.id} usuarioEmail={profile.email} />
        </TabsContent>

        <TabsContent value="cambios" className="mt-6">
          <UsuarioCambiosRecibidos usuarioId={profile.id} usuarioEmail={profile.email} />
        </TabsContent>

        <TabsContent value="notificaciones" className="mt-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="configuracion" className="mt-6">
          <div className="space-y-6">
            {/* Configuración de perfil */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Configuración de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setEditMode('profile')}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar información personal
                </Button>
                
                <Separator />
                
                <Button
                  variant="outline"
                  onClick={() => setEditMode('password')}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Cambiar contraseña
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
