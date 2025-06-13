
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRoles } from '@/hooks/useRoles';
import type { Role } from '@/types/roles';
import { PERMISSION_LABELS, PERMISSION_GROUPS } from '@/types/roles';
import { RolAuditoria } from './RolAuditoria';
import { 
  ArrowLeft, 
  Edit, 
  Shield, 
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Lock
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface RoleDetailProps {
  role: Role;
  onEdit: (role: Role) => void;
  onBack: () => void;
}

// Define system roles that cannot be modified
const SYSTEM_ROLES = ['Administrador', 'Usuario'];

const isSystemRole = (roleName: string): boolean => {
  return SYSTEM_ROLES.includes(roleName);
};

export const RoleDetail = ({ role: initialRole, onEdit, onBack }: RoleDetailProps) => {
  const { toggleRoleStatus, isToggling, roles } = useRoles();
  const [currentRole, setCurrentRole] = useState(initialRole);

  // Update currentRole when roles data changes
  useEffect(() => {
    const updatedRole = roles.find(r => r.id === initialRole.id);
    if (updatedRole) {
      setCurrentRole(updatedRole);
    }
  }, [roles, initialRole.id]);

  const handleToggleStatus = () => {
    if (isSystemRole(currentRole.nombre)) {
      return; // No allow status change for system roles
    }
    toggleRoleStatus({ id: currentRole.id, activo: !currentRole.activo });
  };

  const handleEdit = () => {
    if (isSystemRole(currentRole.nombre)) {
      return; // No allow edit for system roles
    }
    onEdit(currentRole);
  };

  const getPermissionsByGroup = () => {
    const permissionsByGroup: Record<string, string[]> = {};
    
    Object.entries(PERMISSION_GROUPS).forEach(([groupName, permissions]) => {
      const rolePermissions = permissions.filter(permission => 
        currentRole.permisos.includes(permission)
      );
      
      if (rolePermissions.length > 0) {
        permissionsByGroup[groupName] = rolePermissions.map(p => PERMISSION_LABELS[p]);
      }
    });
    
    return permissionsByGroup;
  };

  const permissionsByGroup = getPermissionsByGroup();
  const isSystemRoleItem = isSystemRole(currentRole.nombre);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Roles
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium"
              style={{ backgroundColor: currentRole.color }}
            >
              {currentRole.icono.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{currentRole.nombre}</h1>
                {isSystemRoleItem && (
                  <Badge variant="secondary" className="text-xs">
                    Sistema
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">{currentRole.descripcion}</p>
            </div>
          </div>
          
          {!isSystemRoleItem ? (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar Rol
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Rol protegido del sistema</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información General */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre del Rol</label>
                <p className="text-lg font-semibold mt-1">{currentRole.nombre}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <div className="flex items-center gap-3 mt-1">
                  <Switch
                    checked={currentRole.activo}
                    onCheckedChange={handleToggleStatus}
                    disabled={isToggling || isSystemRoleItem}
                  />
                  <Badge variant={currentRole.activo ? "default" : "secondary"} className="flex items-center gap-1">
                    {currentRole.activo ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {currentRole.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {isSystemRoleItem && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Protegido
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <p className="text-gray-900 mt-1">{currentRole.descripcion}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: currentRole.color }}
                  />
                  <span className="text-gray-900 font-mono">{currentRole.color}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Ícono</label>
                <p className="text-gray-900 mt-1">{currentRole.icono}</p>
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
              <label className="text-sm font-medium text-gray-700">Fecha de Creación</label>
              <p className="text-gray-900 mt-1">
                {new Date(currentRole.created_at).toLocaleDateString('es-ES', {
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
                {new Date(currentRole.updated_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {isSystemRoleItem && (
              <>
                <Separator />
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Rol del Sistema</p>
                    <p>Este rol está protegido y no puede ser modificado o eliminado.</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Permisos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Permisos Asignados ({currentRole.permisos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(permissionsByGroup).length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Este rol no tiene permisos asignados</p>
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

        {/* Auditoría del Rol */}
        <div className="lg:col-span-1">
          <RolAuditoria rolId={currentRole.id} />
        </div>
      </div>
    </div>
  );
};
