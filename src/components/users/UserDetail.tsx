import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  History,
  UserCheck,
  Ban,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { User as UserType } from '@/types/users';
import { UserReportesAsignados } from './UserReportesAsignados';
import { UsuarioAuditoria } from './UsuarioAuditoria';
import { UsuarioCambiosRecibidos } from './UsuarioCambiosRecibidos';
import { UsuarioEstadisticasActividad } from './UsuarioEstadisticasActividad';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface UserDetailProps {
  user: UserType;
  onEdit: (user: UserType) => void;
  onBack: () => void;
}

export const UserDetail = ({ user, onEdit, onBack }: UserDetailProps) => {
  const { toggleUserStatus, isToggling } = useUsers();
  const { resendConfirmation } = useAuth();
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Sin nombre';
  };

  const handleToggleStatus = () => {
    toggleUserStatus({ id: user.id, asset: !user.asset });
  };

  const handleActivateUser = () => {
    toggleUserStatus({ id: user.id, asset: true });
  };

  const handleBlockUser = () => {
    toggleUserStatus({ id: user.id, asset: null });
  };

  const handleResendConfirmation = async () => {
    setIsResendingConfirmation(true);
    
    try {
      const { error } = await resendConfirmation(user.email);
      
      if (error) {
        toast({
          title: 'Error',
          description: `Error al reenviar confirmación: ${error.message}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Éxito',
          description: `Email de confirmación reenviado correctamente a ${user.email}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Error inesperado al reenviar confirmación`,
        variant: 'destructive',
      });
    } finally {
      setIsResendingConfirmation(false);
    }
  };

  const getStatusBadge = () => {
    if (user.asset === null) {
      return {
        variant: "destructive" as const,
        icon: <XCircle className="h-3 w-3" />,
        text: "Bloqueado"
      };
    } else if (user.asset) {
      return {
        variant: "default" as const,
        icon: <CheckCircle className="h-3 w-3" />,
        text: "Activo"
      };
    } else {
      return {
        variant: "secondary" as const,
        icon: <XCircle className="h-3 w-3" />,
        text: "Inactivo"
      };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalle del Usuario</h1>
            <p className="text-muted-foreground">Información completa del usuario</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => onEdit(user)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Usuario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar || ''} alt={getFullName()} />
                  <AvatarFallback className="text-xl">
                    {getInitials(user.first_name, user.last_name, user.email)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{getFullName()}</CardTitle>
              <p className="text-muted-foreground">{user.email}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Registrado: {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Actualizado: {format(new Date(user.updated_at), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {user.confirmed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {user.confirmed ? 'Email confirmado' : 'Email no confirmado'}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Roles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {user.role && user.role.length > 0 ? (
                    user.role.map((rol, index) => (
                      <Badge key={index} variant="secondary">
                        {rol}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin roles asignados</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Control de Estado del Usuario */}
              <div className="space-y-3">
                <h4 className="font-medium">Estado del Usuario</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={statusBadge.variant} 
                      className="flex items-center gap-1"
                    >
                      {statusBadge.icon}
                      {statusBadge.text}
                    </Badge>
                  </div>
                  
                  {user.asset !== null && (
                    <Switch
                      checked={user.asset}
                      onCheckedChange={handleToggleStatus}
                      disabled={isToggling}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {user.asset === null && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleActivateUser}
                      disabled={isToggling}
                      className="w-full"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      {isToggling ? 'Desbloqueando...' : 'Desbloquear Usuario'}
                    </Button>
                  )}
                  
                  {user.asset !== null && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBlockUser}
                      disabled={isToggling}
                      className="w-full"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      {isToggling ? 'Bloqueando...' : 'Bloquear Usuario'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Reenvío de Confirmación */}
              {!user.confirmed && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Email no confirmado</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      disabled={isResendingConfirmation}
                      className="w-full"
                    >
                      {isResendingConfirmation ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      {isResendingConfirmation ? 'Enviando...' : 'Reenviar Confirmación'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Información Detallada */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="reportes" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reportes" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Reportes</span>
              </TabsTrigger>
              <TabsTrigger value="auditoria" className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Auditoría</span>
              </TabsTrigger>
              <TabsTrigger value="cambios" className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Cambios</span>
              </TabsTrigger>
              <TabsTrigger value="actividad" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Actividad</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reportes">
              <UserReportesAsignados 
                userId={user.id} 
                userName={getFullName()} 
              />
            </TabsContent>

            <TabsContent value="auditoria">
              <UsuarioAuditoria 
                usuarioId={user.id} 
                usuarioEmail={user.email}
              />
            </TabsContent>

            <TabsContent value="cambios">
              <UsuarioCambiosRecibidos 
                usuarioId={user.id} 
                usuarioEmail={user.email}
              />
            </TabsContent>

            <TabsContent value="actividad">
              <UsuarioEstadisticasActividad 
                usuarioId={user.id} 
                usuarioEmail={user.email}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
