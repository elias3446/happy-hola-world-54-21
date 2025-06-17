
import { supabase } from '@/integrations/supabase/client';
import type { Permission } from '@/hooks/useSecurity';

export interface UserInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    color: string;
    icono: string;
    permisos: Permission[];
  }>;
  allPermissions: Permission[];
  isAdmin: boolean;
}

export class UserPermissionService {
  private static instance: UserPermissionService;
  
  static getInstance(): UserPermissionService {
    if (!UserPermissionService.instance) {
      UserPermissionService.instance = new UserPermissionService();
    }
    return UserPermissionService.instance;
  }

  async getCurrentUserInfo(): Promise<UserInfo | null> {
    try {
      console.log('🔍 JARVIS: Consultando información del usuario en la base de datos...');
      
      // Obtener usuario autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ JARVIS: No hay usuario autenticado:', authError);
        return null;
      }

      console.log('👤 JARVIS: Usuario encontrado:', user.email);

      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ JARVIS: Error obteniendo perfil:', profileError);
        return null;
      }

      console.log('📋 JARVIS: Perfil obtenido:', profile);

      // Obtener roles asignados al usuario con sus permisos
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
        console.error('❌ JARVIS: Error obteniendo roles:', rolesError);
        return null;
      }

      console.log('🎭 JARVIS: Roles obtenidos:', userRoles);

      // Procesar roles y consolidar permisos
      const roles = userRoles?.map(ur => ({
        id: ur.roles.id,
        nombre: ur.roles.nombre,
        descripcion: ur.roles.descripcion,
        color: ur.roles.color,
        icono: ur.roles.icono,
        permisos: ur.roles.permisos as Permission[]
      })) || [];

      // Consolidar todos los permisos únicos
      const allPermissions = Array.from(
        new Set(roles.flatMap(role => role.permisos))
      );

      // Determinar si es administrador
      const isAdmin = allPermissions.includes('crear_usuario') || 
                     allPermissions.includes('eliminar_usuario') ||
                     profile?.role?.includes('admin');

      const userInfo: UserInfo = {
        id: user.id,
        email: user.email || '',
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        roles,
        allPermissions,
        isAdmin
      };

      console.log('✅ JARVIS: Información completa del usuario procesada:', {
        email: userInfo.email,
        rolesCount: userInfo.roles.length,
        permissionsCount: userInfo.allPermissions.length,
        isAdmin: userInfo.isAdmin
      });

      return userInfo;

    } catch (error) {
      console.error('💥 JARVIS: Error crítico consultando usuario:', error);
      return null;
    }
  }

  async canUserPerformAction(action: string): Promise<{
    canPerform: boolean;
    reason?: string;
    userInfo?: UserInfo;
  }> {
    const userInfo = await this.getCurrentUserInfo();
    
    if (!userInfo) {
      return {
        canPerform: false,
        reason: 'No se pudo obtener información del usuario'
      };
    }

    // Mapeo de acciones a permisos requeridos
    const actionPermissions: Record<string, Permission[]> = {
      'crear_reporte': ['crear_reporte'],
      'editar_reporte': ['editar_reporte'],
      'eliminar_reporte': ['eliminar_reporte'],
      'ver_reportes': ['ver_reporte'],
      'gestionar_usuarios': ['ver_usuario', 'crear_usuario'],
      'asignar_roles': ['crear_rol', 'editar_rol'],
      'gestionar_categorias': ['crear_categoria', 'editar_categoria'],
      'gestionar_estados': ['crear_estado', 'editar_estado'],
      'ver_auditoria': ['ver_reporte'], // Auditoría requiere al menos ver reportes
      'exportar_datos': ['ver_reporte']
    };

    const requiredPermissions = actionPermissions[action];
    
    if (!requiredPermissions) {
      // Si no hay permisos específicos requeridos, permitir la acción
      return { canPerform: true, userInfo };
    }

    // Verificar si tiene al menos uno de los permisos requeridos
    const hasPermission = requiredPermissions.some(permission => 
      userInfo.allPermissions.includes(permission)
    );

    if (!hasPermission) {
      return {
        canPerform: false,
        reason: `Necesitas uno de estos permisos: ${requiredPermissions.join(', ')}. Tus roles actuales: ${userInfo.roles.map(r => r.nombre).join(', ')}`,
        userInfo
      };
    }

    return { canPerform: true, userInfo };
  }
}

export const userPermissionService = UserPermissionService.getInstance();
