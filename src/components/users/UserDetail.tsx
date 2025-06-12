
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useUsers, type User } from '@/hooks/useUsers';
import { PERMISSION_LABELS, PERMISSION_GROUPS } from '@/types/roles';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Mail,
  UserCheck,
  Lock,
  Crown,
  User as UserIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserDetailProps {
  user: User;
  onEdit: (user: User) => void;
  onBack: () => void;
}

export const UserDetail = ({ user: initialUser, onEdit, onBack }: UserDetailProps) => {
  const { toggleUserStatus, isToggling, users } = useUsers();
  const [currentUser, setCurrentUser] = useState(initialUser);

  // Update currentUser when users data changes
  useEffect(() => {
    const updatedUser = users.find(u => u.id === initialUser.id);
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  }, [users, initialUser.id]);

  // Helper function to get status badge variant and icon
  const getStatusBadge = (user: User) => {
    if (user.asset === null) {
      return {
        variant: "destructive" as const,
        icon: <Lock className="h-3 w-3" />,
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

  // Helper function to get user type display from profile role
  const getUserTypeDisplay = (userRoles: string[]) => {
    const hasAdmin = userRoles.includes('admin');
    const hasUser = userRoles.includes('user');
    
    if (hasAdmin && hasUser) {
      return 'Administrador y Usuario';
    } else if (hasAdmin) {
      return 'Administrador';
    } else if (hasUser) {
      return 'Usuario';
    }
    return 'Usuario'; // Default
  };

  // Helper function to get user type badge variant from profile role
  const getUserTypeBadge = (userRoles: string[]) => {
    const hasAdmin = userRoles.includes('admin');
    const hasUser = userRoles.includes('user');
    
    if (hasAdmin && hasUser) {
      return {
        variant: "default" as const,
        icon: <Crown className="h-3 w-3" />,
        text: "Admin + Usuario"
      };
    } else if (hasAdmin) {
      return {
        variant: "destructive" as const,
        icon: <Crown className="h-3 w-3" />,
        text: "Administrador"
      };
    } else {
      return {
        variant: "secondary" as const,
        icon: <UserIcon className="h-3 w-3" />,
        text: "Usuario"
      };
    }
  };

  const handleStatusToggle = (checked: boolean) => {
    // Solo permitir cambio entre activo/inactivo, no a bloqueado
    toggleUserStatus({ id: currentUser.id, asset: checked });
  };

  const getAllUserPermissions = () => {
    const allPermissions = new Set<string>();
    currentUser.user_roles?.forEach(userRole => {
      userRole.roles.permisos.forEach(permission => {
        allPermissions.add(permission);
      });
    });
    return Array.from(allPermissions);
  };

  const getPermissionsByGroup = () => {
    const userPermissions = getAllUserPermissions();
    const permissionsByGroup: Record<string, string[]> = {};
    
    Object.entries(PERMISSION_GROUPS).forEach(([groupName, permissions]) => {
      const groupPermissions = permissions.filter(permission => 
        userPermissions.includes(permission)
      );
      
      if (groupPermissions.length > 0) {
        permissionsByGroup[groupName] = groupPermissions.map(p => PERMISSION_LABELS[p]);
      }
    });
    
    return permissionsByGroup;
  };

  const permissionsByGroup = getPermissionsByGroup();
  const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
  const statusBadge = getStatusBadge(currentUser);
  const isBlocked = currentUser.asset === null;
  const profileTypeBadge = getUserTypeBadge(currentUser.role || ['user']);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Usuarios
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentUser.avatar || undefined} />
              <AvatarFallback className="text-lg">
                {((currentUser.first_name || '').charAt(0) + (currentUser.last_name || '').charAt(0)).toUpperCase() || 
                 currentUser.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{fullName || currentUser.email}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {currentUser.email}
              </p>
            </div>
          </div>
          
          <Button onClick={() => onEdit(currentUser)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Usuario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información General */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                <p className="text-lg font-semibold mt-1">{fullName || 'No especificado'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-lg mt-1">{currentUser.email}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Tipo de Usuario (Perfil)</label>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={profileTypeBadge.variant} className="flex items-center gap-1">
                    {profileTypeBadge.icon}
                    {profileTypeBadge.text}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Roles básicos asignados en el perfil: {currentUser.role?.join(', ') || 'Ninguno'}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Estado del Usuario</label>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                    {statusBadge.icon}
                    {statusBadge.text}
                  </Badge>
                  
                  {!isBlocked && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentUser.asset === true}
                        onCheckedChange={handleStatusToggle}
                        disabled={isToggling}
                      />
                      <span className="text-sm text-gray-600">
                        {isToggling ? 'Cambiando...' : (currentUser.asset ? 'Activo' : 'Inactivo')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {isBlocked && "Usuario bloqueado - No se puede cambiar el estado"}
                  {!isBlocked && currentUser.asset === true && "El usuario puede acceder al sistema"}
                  {!isBlocked && currentUser.asset === false && "El usuario no puede acceder pero sigue visible"}
                </div>
              </div>
            </div>

            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-700">Estado de Confirmación</label>
              <div className="mt-2">
                <Badge variant={currentUser.confirmed ? "default" : "secondary"} className="flex items-center gap-1">
                  {currentUser.confirmed ? (
                    <UserCheck className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {currentUser.confirmed ? 'Email Confirmado' : 'Pendiente de Confirmación'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha de Registro</label>
              <p className="text-gray-900 mt-1">
                {new Date(currentUser.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Última Actualización</label>
              <p className="text-gray-900 mt-1">
                {new Date(currentUser.updated_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">ID del Usuario</label>
              <p className="text-gray-900 mt-1 font-mono text-xs break-all">{currentUser.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Roles Asignados */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles Asignados ({currentUser.user_roles?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!currentUser.user_roles || currentUser.user_roles.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Este usuario no tiene roles asignados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentUser.user_roles.map((userRole) => (
                  <Card key={userRole.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: userRole.roles.color }}
                        >
                          {userRole.roles.icono.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium">{userRole.roles.nombre}</h4>
                          <p className="text-sm text-gray-600">{userRole.roles.descripcion}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                          Asignado el {new Date(userRole.assigned_at).toLocaleDateString('es-ES')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userRole.roles.permisos.length} permisos incluidos
                        </p>
                        <Badge variant={userRole.roles.activo ? "default" : "secondary"} className="text-xs">
                          {userRole.roles.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permisos Efectivos */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Permisos Efectivos ({getAllUserPermissions().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(permissionsByGroup).length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Este usuario no tiene permisos asignados</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(permissionsByGroup).map(([groupName, permissions]) => (
                  <div key={groupName}>
                    <h4 className="font-medium text-gray-900 mb-3">{groupName}</h4>
                    <div className="flex flex-wrap gap-2">
                      {permissions.map((permission) => (
                        <Badge key={permission} variant="secondary">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
