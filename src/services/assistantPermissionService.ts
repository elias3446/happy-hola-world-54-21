
import { supabase } from '@/integrations/supabase/client';
import type { Permission } from '@/hooks/useSecurity';

export interface UserPermissionInfo {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  permissions: Permission[];
  roles: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    color: string;
    icono: string;
  }>;
}

export class AssistantPermissionService {
  private static instance: AssistantPermissionService;
  
  static getInstance(): AssistantPermissionService {
    if (!AssistantPermissionService.instance) {
      AssistantPermissionService.instance = new AssistantPermissionService();
    }
    return AssistantPermissionService.instance;
  }

  async getCurrentUserPermissions(): Promise<UserPermissionInfo | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('JARVIS: No hay usuario autenticado');
        return null;
      }

      // Obtener información del perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('JARVIS: Error obteniendo perfil del usuario:', profileError);
        return null;
      }

      // Obtener roles asignados al usuario
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          roles!inner(
            id,
            nombre,
            descripcion,
            color,
            icono,
            permisos
          )
        `)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .is('roles.deleted_at', null)
        .eq('roles.activo', true);

      if (rolesError) {
        console.error('JARVIS: Error obteniendo roles del usuario:', rolesError);
        return null;
      }

      // Consolidar todos los permisos únicos
      const allPermissions = new Set<Permission>();
      const rolesInfo = [];

      if (userRoles) {
        userRoles.forEach(userRole => {
          if (userRole.roles && userRole.roles.permisos) {
            userRole.roles.permisos.forEach(permiso => {
              allPermissions.add(permiso as Permission);
            });
            rolesInfo.push({
              id: userRole.roles.id,
              nombre: userRole.roles.nombre,
              descripcion: userRole.roles.descripcion,
              color: userRole.roles.color,
              icono: userRole.roles.icono
            });
          }
        });
      }

      // Verificar si es administrador (basado en roles del perfil o permisos específicos)
      const isAdmin = profile?.role?.includes('admin') || 
                     allPermissions.has('crear_usuario') || 
                     allPermissions.has('eliminar_usuario');

      const userInfo: UserPermissionInfo = {
        userId: user.id,
        email: user.email || '',
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        isAdmin,
        permissions: Array.from(allPermissions),
        roles: rolesInfo
      };

      console.log('JARVIS: Información de permisos del usuario:', userInfo);
      return userInfo;

    } catch (error) {
      console.error('JARVIS: Error consultando permisos del usuario:', error);
      return null;
    }
  }

  async hasPermission(permission: Permission): Promise<boolean> {
    try {
      const userInfo = await this.getCurrentUserPermissions();
      return userInfo?.permissions.includes(permission) || false;
    } catch (error) {
      console.error('JARVIS: Error verificando permiso:', error);
      return false;
    }
  }

  async canExecuteAction(actionType: string): Promise<{canExecute: boolean, reason?: string}> {
    const userInfo = await this.getCurrentUserPermissions();
    
    if (!userInfo) {
      return {
        canExecute: false,
        reason: 'Usuario no autenticado'
      };
    }

    // Mapeo de acciones a permisos requeridos
    const actionPermissions: Record<string, Permission[]> = {
      'create_report': ['crear_reporte'],
      'edit_report': ['editar_reporte'],
      'delete_report': ['eliminar_reporte'],
      'view_reports': ['ver_reporte'],
      'manage_users': ['ver_usuario', 'crear_usuario'],
      'assign_roles': ['crear_rol', 'editar_rol'],
      'manage_categories': ['crear_categoria', 'editar_categoria'],
      'manage_estados': ['crear_estado', 'editar_estado'],
      'view_analytics': ['ver_reporte'], // Análisis requiere ver reportes
      'export_data': ['ver_reporte']
    };

    const requiredPermissions = actionPermissions[actionType];
    
    if (!requiredPermissions) {
      // Si no hay permisos específicos requeridos, permitir la acción
      return { canExecute: true };
    }

    // Verificar si tiene al menos uno de los permisos requeridos
    const hasRequiredPermission = requiredPermissions.some(permission => 
      userInfo.permissions.includes(permission)
    );

    if (!hasRequiredPermission) {
      return {
        canExecute: false,
        reason: `Necesitas uno de estos permisos: ${requiredPermissions.join(', ')}`
      };
    }

    return { canExecute: true };
  }

  async logPermissionCheck(action: string, granted: boolean, userId?: string) {
    try {
      // Registrar en actividades para auditoría
      const { error } = await supabase.rpc('registrar_actividad', {
        p_activity_type: 'READ',
        p_descripcion: `JARVIS verificó permisos para acción: ${action} - ${granted ? 'PERMITIDO' : 'DENEGADO'}`,
        p_tabla_afectada: 'jarvis_permissions',
        p_registro_id: userId || null,
        p_metadatos: {
          assistant: 'JARVIS',
          action,
          granted,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('JARVIS: Error registrando verificación de permisos:', error);
      }
    } catch (error) {
      console.error('JARVIS: Error en log de permisos:', error);
    }
  }
}

export const assistantPermissionService = AssistantPermissionService.getInstance();
