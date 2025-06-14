import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReporteWithDates {
  id: string;
  activo: boolean;
  created_at: string;
  priority: string;
  categoria: { nombre: string; color: string } | null;
  estado: { nombre: string; color: string } | null;
  assigned_to: string | null;
}

interface UserWithDates {
  id: string;
  asset: boolean;
  confirmed: boolean;
  created_at: string;
}

interface DashboardStats {
  reportes: {
    total: number;
    activos: number;
    asignados: number;
    porEstado: { estado: string; count: number; color: string }[];
    porCategoria: { categoria: string; count: number; color: string }[];
    porPrioridad: { priority: string; count: number }[];
    porActividad: { actividad: string; count: number; color: string }[];
    porAsignacion: { asignacion: string; count: number; color: string }[];
    recientes: number; // últimos 7 días
    datosCompletos: ReporteWithDates[]; // Agregamos los datos completos para filtrado
  };
  usuarios: {
    total: number;
    activos: number;
    confirmados: number;
    recientes: number; // últimos 7 días
    porEstadoActivacion: { estado: string; count: number; color: string }[];
    porConfirmacion: { categoria: string; count: number; color: string }[];
    datosCompletos: UserWithDates[];
  };
  roles: {
    total: number;
    activos: number;
    asignaciones: number;
  };
  categorias: {
    total: number;
    activas: number;
  };
  estados: {
    total: number;
    activos: number;
  };
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      console.log('Fetching dashboard statistics...');

      // Obtener estadísticas de reportes con datos completos
      const { data: reportes, error: reportesError } = await supabase
        .from('reportes')
        .select(`
          id,
          activo,
          created_at,
          priority,
          assigned_to,
          categoria:categories(nombre, color),
          estado:estados(nombre, color)
        `)
        .is('deleted_at', null);

      if (reportesError) {
        console.error('Error fetching reportes stats:', reportesError);
        throw reportesError;
      }

      // Obtener estadísticas de usuarios con datos completos
      const { data: usuarios, error: usuariosError } = await supabase
        .from('profiles')
        .select('id, asset, confirmed, created_at')
        .is('deleted_at', null);

      if (usuariosError) {
        console.error('Error fetching usuarios stats:', usuariosError);
        throw usuariosError;
      }

      // Obtener estadísticas de roles
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('id, activo')
        .is('deleted_at', null);

      if (rolesError) {
        console.error('Error fetching roles stats:', rolesError);
        throw rolesError;
      }

      // Obtener asignaciones de roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('id')
        .is('deleted_at', null);

      if (userRolesError) {
        console.error('Error fetching user roles stats:', userRolesError);
        throw userRolesError;
      }

      // Obtener estadísticas de categorías
      const { data: categorias, error: categoriasError } = await supabase
        .from('categories')
        .select('id, activo')
        .is('deleted_at', null);

      if (categoriasError) {
        console.error('Error fetching categorias stats:', categoriasError);
        throw categoriasError;
      }

      // Obtener estadísticas de estados
      const { data: estados, error: estadosError } = await supabase
        .from('estados')
        .select('id, activo')
        .is('deleted_at', null);

      if (estadosError) {
        console.error('Error fetching estados stats:', estadosError);
        throw estadosError;
      }

      // Calcular estadísticas usando datos reales
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Estadísticas de reportes
      const reportesActivos = reportes?.filter(r => r.activo) || [];
      const reportesAsignados = reportes?.filter(r => r.assigned_to !== null) || [];
      const reportesRecientes = reportes?.filter(r => 
        new Date(r.created_at) >= sevenDaysAgo
      ) || [];

      // Guardar datos completos para filtrado posterior
      const datosCompletos: ReporteWithDates[] = reportes?.map(r => ({
        id: r.id,
        activo: r.activo,
        created_at: r.created_at,
        priority: r.priority || 'medio',
        categoria: r.categoria,
        estado: r.estado,
        assigned_to: r.assigned_to
      })) || [];

      // Agrupar por estado
      const porEstado = reportes?.reduce((acc, reporte) => {
        const estadoNombre = reporte.estado?.nombre || 'Sin estado';
        const estadoColor = reporte.estado?.color || '#6B7280';
        const existing = acc.find(item => item.estado === estadoNombre);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ estado: estadoNombre, count: 1, color: estadoColor });
        }
        return acc;
      }, [] as { estado: string; count: number; color: string }[]) || [];

      // Agrupar por categoría
      const porCategoria = reportes?.reduce((acc, reporte) => {
        const categoriaNombre = reporte.categoria?.nombre || 'Sin categoría';
        const categoriaColor = reporte.categoria?.color || '#6B7280';
        const existing = acc.find(item => item.categoria === categoriaNombre);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ categoria: categoriaNombre, count: 1, color: categoriaColor });
        }
        return acc;
      }, [] as { categoria: string; count: number; color: string }[]) || [];

      // Agrupar por prioridad
      const porPrioridad = reportes?.reduce((acc, reporte) => {
        const prioridad = reporte.priority || 'medio';
        const existing = acc.find(item => item.priority === prioridad);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ priority: prioridad, count: 1 });
        }
        return acc;
      }, [] as { priority: string; count: number }[]) || [];

      // Nuevas distribuciones requeridas
      const porActividad = [
        { actividad: 'Activos', count: reportesActivos.length, color: '#10B981' },
        { actividad: 'Inactivos', count: (reportes?.length || 0) - reportesActivos.length, color: '#EF4444' }
      ];

      const porAsignacion = [
        { asignacion: 'Asignados', count: reportesAsignados.length, color: '#3B82F6' },
        { asignacion: 'Sin asignar', count: (reportes?.length || 0) - reportesAsignados.length, color: '#F59E0B' }
      ];

      // Estadísticas de usuarios
      const usuariosActivos = usuarios?.filter(u => u.asset) || [];
      const usuariosConfirmados = usuarios?.filter(u => u.confirmed) || [];
      const usuariosRecientes = usuarios?.filter(u => 
        new Date(u.created_at) >= sevenDaysAgo
      ) || [];

      // Guardar datos completos de usuarios para filtrado posterior
      const usuariosCompletos: UserWithDates[] = usuarios?.map(u => ({
        id: u.id,
        asset: u.asset || false,
        confirmed: u.confirmed || false,
        created_at: u.created_at
      })) || [];

      // Agrupar usuarios por estado de activación
      const usuariosPorEstadoActivacion = [
        { estado: 'Activos', count: usuariosActivos.length, color: '#10B981' },
        { estado: 'Inactivos', count: (usuarios?.length || 0) - usuariosActivos.length, color: '#EF4444' }
      ];

      // Agrupar usuarios por confirmación
      const usuariosPorConfirmacion = [
        { categoria: 'Confirmados', count: usuariosConfirmados.length, color: '#3B82F6' },
        { categoria: 'No confirmados', count: (usuarios?.length || 0) - usuariosConfirmados.length, color: '#F59E0B' }
      ];

      // Estadísticas de roles
      const rolesActivos = roles?.filter(r => r.activo) || [];

      // Estadísticas de categorías
      const categoriasActivas = categorias?.filter(c => c.activo) || [];

      // Estadísticas de estados
      const estadosActivos = estados?.filter(e => e.activo) || [];

      const stats: DashboardStats = {
        reportes: {
          total: reportes?.length || 0,
          activos: reportesActivos.length,
          asignados: reportesAsignados.length,
          porEstado,
          porCategoria,
          porPrioridad,
          porActividad,
          porAsignacion,
          recientes: reportesRecientes.length,
          datosCompletos, // Incluimos los datos completos
        },
        usuarios: {
          total: usuarios?.length || 0,
          activos: usuariosActivos.length,
          confirmados: usuariosConfirmados.length,
          recientes: usuariosRecientes.length,
          porEstadoActivacion: usuariosPorEstadoActivacion,
          porConfirmacion: usuariosPorConfirmacion,
          datosCompletos: usuariosCompletos,
        },
        roles: {
          total: roles?.length || 0,
          activos: rolesActivos.length,
          asignaciones: userRoles?.length || 0,
        },
        categorias: {
          total: categorias?.length || 0,
          activas: categoriasActivas.length,
        },
        estados: {
          total: estados?.length || 0,
          activos: estadosActivos.length,
        },
      };

      console.log('Dashboard stats calculated:', stats);
      return stats;
    },
  });
};
