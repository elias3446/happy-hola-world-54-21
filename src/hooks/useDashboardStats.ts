
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReporteWithDates {
  id: string;
  activo: boolean;
  created_at: string;
  priority: string;
  categoria: { nombre: string; color: string } | null;
  estado: { nombre: string; color: string } | null;
}

interface DashboardStats {
  reportes: {
    total: number;
    activos: number;
    porEstado: { estado: string; count: number; color: string }[];
    porCategoria: { categoria: string; count: number; color: string }[];
    porPrioridad: { priority: string; count: number }[];
    recientes: number; // últimos 7 días
    datosCompletos: ReporteWithDates[]; // Agregamos los datos completos para filtrado
  };
  usuarios: {
    total: number;
    activos: number;
    confirmados: number;
    recientes: number; // últimos 7 días
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

      // Obtener estadísticas de reportes con datos completos - FILTRAR CORRECTAMENTE
      const { data: reportes, error: reportesError } = await supabase
        .from('reportes')
        .select(`
          id,
          activo,
          created_at,
          priority,
          categoria:categories(nombre, color),
          estado:estados(nombre, color)
        `)
        .is('deleted_at', null); // ESTO ES CLAVE - Solo reportes no eliminados

      if (reportesError) {
        console.error('Error fetching reportes stats:', reportesError);
        throw reportesError;
      }

      console.log('Reportes fetched from database (ONLY non-deleted):', reportes?.length || 0, reportes);

      // Obtener estadísticas de usuarios - FILTRAR CORRECTAMENTE  
      const { data: usuarios, error: usuariosError } = await supabase
        .from('profiles')
        .select('id, asset, confirmed, created_at')
        .is('deleted_at', null); // Solo usuarios no eliminados

      if (usuariosError) {
        console.error('Error fetching usuarios stats:', usuariosError);
        throw usuariosError;
      }

      console.log('Usuarios fetched from database (ONLY non-deleted):', usuarios?.length || 0);

      // Obtener estadísticas de roles - FILTRAR CORRECTAMENTE
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('id, activo')
        .is('deleted_at', null); // Solo roles no eliminados

      if (rolesError) {
        console.error('Error fetching roles stats:', rolesError);
        throw rolesError;
      }

      // Obtener asignaciones de roles - FILTRAR CORRECTAMENTE
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('id')
        .is('deleted_at', null); // Solo asignaciones no eliminadas

      if (userRolesError) {
        console.error('Error fetching user roles stats:', userRolesError);
        throw userRolesError;
      }

      // Obtener estadísticas de categorías - FILTRAR CORRECTAMENTE
      const { data: categorias, error: categoriasError } = await supabase
        .from('categories')
        .select('id, activo')
        .is('deleted_at', null); // Solo categorías no eliminadas

      if (categoriasError) {
        console.error('Error fetching categorias stats:', categoriasError);
        throw categoriasError;
      }

      // Obtener estadísticas de estados - FILTRAR CORRECTAMENTE
      const { data: estados, error: estadosError } = await supabase
        .from('estados')
        .select('id, activo')
        .is('deleted_at', null); // Solo estados no eliminados

      if (estadosError) {
        console.error('Error fetching estados stats:', estadosError);
        throw estadosError;
      }

      // Calcular estadísticas usando SOLO datos reales de la base de datos
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Estadísticas de reportes - SOLO DATOS REALES
      const reportesActivos = reportes?.filter(r => r.activo) || [];
      const reportesRecientes = reportes?.filter(r => 
        new Date(r.created_at) >= sevenDaysAgo
      ) || [];

      console.log('REAL DATABASE STATS:', {
        totalReportes: reportes?.length || 0,
        reportesActivos: reportesActivos.length,
        reportesRecientes: reportesRecientes.length
      });

      // Guardar datos completos para filtrado posterior
      const datosCompletos: ReporteWithDates[] = reportes?.map(r => ({
        id: r.id,
        activo: r.activo,
        created_at: r.created_at,
        priority: r.priority || 'medio',
        categoria: r.categoria,
        estado: r.estado
      })) || [];

      // Agrupar por estado - SOLO DATOS REALES
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

      // Agrupar por categoría - SOLO DATOS REALES
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

      // Agrupar por prioridad - SOLO DATOS REALES
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

      // Estadísticas de usuarios - SOLO DATOS REALES
      const usuariosActivos = usuarios?.filter(u => u.asset) || [];
      const usuariosConfirmados = usuarios?.filter(u => u.confirmed) || [];
      const usuariosRecientes = usuarios?.filter(u => 
        new Date(u.created_at) >= sevenDaysAgo
      ) || [];

      // Estadísticas de roles - SOLO DATOS REALES
      const rolesActivos = roles?.filter(r => r.activo) || [];

      // Estadísticas de categorías - SOLO DATOS REALES
      const categoriasActivas = categorias?.filter(c => c.activo) || [];

      // Estadísticas de estados - SOLO DATOS REALES
      const estadosActivos = estados?.filter(e => e.activo) || [];

      const stats: DashboardStats = {
        reportes: {
          total: reportes?.length || 0, // DATO REAL DE LA BASE DE DATOS
          activos: reportesActivos.length, // DATO REAL DE LA BASE DE DATOS
          porEstado, // DATOS REALES DE LA BASE DE DATOS
          porCategoria, // DATOS REALES DE LA BASE DE DATOS
          porPrioridad, // DATOS REALES DE LA BASE DE DATOS
          recientes: reportesRecientes.length, // DATO REAL DE LA BASE DE DATOS
          datosCompletos, // DATOS REALES DE LA BASE DE DATOS
        },
        usuarios: {
          total: usuarios?.length || 0,
          activos: usuariosActivos.length,
          confirmados: usuariosConfirmados.length,
          recientes: usuariosRecientes.length,
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

      console.log('FINAL Dashboard stats calculated WITH REAL DATABASE DATA:', stats);
      return stats;
    },
  });
};
