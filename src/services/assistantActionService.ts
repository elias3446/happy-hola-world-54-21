
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class AssistantActionService {
  private static instance: AssistantActionService;
  
  static getInstance(): AssistantActionService {
    if (!AssistantActionService.instance) {
      AssistantActionService.instance = new AssistantActionService();
    }
    return AssistantActionService.instance;
  }

  // Ejecutar crear reporte
  async createReport(data: {
    nombre: string;
    descripcion: string;
    categoria_id?: string;
    estado_id?: string;
    direccion?: string;
    latitud?: number;
    longitud?: number;
    priority?: 'urgente' | 'alto' | 'medio' | 'bajo';
  }, userId: string): Promise<ActionResult> {
    try {
      // Get default category and estado if not provided
      let categoria_id = data.categoria_id;
      let estado_id = data.estado_id;

      if (!categoria_id) {
        const { data: defaultCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('nombre', 'Sin categoría')
          .single();
        categoria_id = defaultCategory?.id;
      }

      if (!estado_id) {
        const { data: defaultEstado } = await supabase
          .from('estados')
          .select('id')
          .eq('nombre', 'Sin estado')
          .single();
        estado_id = defaultEstado?.id;
      }

      const { data: reporte, error } = await supabase
        .from('reportes')
        .insert({
          nombre: data.nombre,
          descripcion: data.descripcion,
          categoria_id: categoria_id!,
          estado_id: estado_id!,
          direccion: data.direccion,
          latitud: data.latitud,
          longitud: data.longitud,
          priority: data.priority || 'urgente',
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: `Reporte "${data.nombre}" creado exitosamente`,
        data: reporte
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear el reporte',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Obtener estadísticas del sistema
  async getSystemStats(): Promise<ActionResult> {
    try {
      const [reportesRes, usuariosRes, categoriasRes, estadosRes] = await Promise.all([
        supabase.from('reportes').select('*', { count: 'exact' }),
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('categories').select('*', { count: 'exact' }),
        supabase.from('estados').select('*', { count: 'exact' })
      ]);

      const stats = {
        reportes: reportesRes.count || 0,
        usuarios: usuariosRes.count || 0,
        categorias: categoriasRes.count || 0,
        estados: estadosRes.count || 0
      };

      return {
        success: true,
        message: 'Estadísticas del sistema obtenidas',
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener estadísticas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Buscar reportes con filtros
  async searchReports(filters: {
    search?: string;
    categoria?: string;
    estado?: string;
    priority?: 'urgente' | 'alto' | 'medio' | 'bajo';
    limit?: number;
  }): Promise<ActionResult> {
    try {
      let query = supabase
        .from('reportes')
        .select(`
          *,
          categories(nombre, color),
          estados(nombre, color),
          profiles!reportes_created_by_fkey(first_name, last_name, email)
        `);

      if (filters.search) {
        query = query.ilike('nombre', `%${filters.search}%`);
      }

      if (filters.categoria) {
        query = query.eq('categoria_id', filters.categoria);
      }

      if (filters.estado) {
        query = query.eq('estado_id', filters.estado);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      query = query.limit(filters.limit || 20);

      const { data, error } = await query;
      if (error) throw error;

      return {
        success: true,
        message: `Encontrados ${data?.length || 0} reportes`,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al buscar reportes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Obtener detalles de un reporte específico
  async getReportDetails(reporteId: string): Promise<ActionResult> {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .select(`
          *,
          categories(nombre, color, icono),
          estados(nombre, color, icono),
          profiles!reportes_created_by_fkey(first_name, last_name, email),
          profiles!reportes_assigned_to_fkey(first_name, last_name, email)
        `)
        .eq('id', reporteId)
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Detalles del reporte obtenidos',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener detalles del reporte',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateReportStatus(reporteId: string, estadoId: string, userId: string): Promise<ActionResult> {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .update({ 
          estado_id: estadoId,
          updated_at: new Date().toISOString()
        })
        .eq('id', reporteId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Estado del reporte actualizado exitosamente',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al actualizar el estado del reporte',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async assignReport(reporteId: string, assignedTo: string, userId: string): Promise<ActionResult> {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .update({ 
          assigned_to: assignedTo,
          updated_at: new Date().toISOString()
        })
        .eq('id', reporteId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Reporte asignado exitosamente',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al asignar el reporte',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getReportsByLocation(bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<ActionResult> {
    try {
      let query = supabase
        .from('reportes')
        .select(`
          id, nombre, descripcion, latitud, longitud, priority,
          categories(nombre, color),
          estados(nombre, color)
        `)
        .not('latitud', 'is', null)
        .not('longitud', 'is', null);

      if (bounds) {
        query = query
          .gte('latitud', bounds.south)
          .lte('latitud', bounds.north)
          .gte('longitud', bounds.west)
          .lte('longitud', bounds.east);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        success: true,
        message: `Encontrados ${data?.length || 0} reportes con ubicación`,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener reportes por ubicación',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async createCategory(data: {
    nombre: string;
    descripcion?: string;
    color?: string;
    icono?: string;
  }, userId: string): Promise<ActionResult> {
    try {
      const { data: categoria, error } = await supabase
        .from('categories')
        .insert({
          nombre: data.nombre,
          descripcion: data.descripcion,
          color: data.color || '#3B82F6',
          icono: data.icono || 'Folder',
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: `Categoría "${data.nombre}" creada exitosamente`,
        data: categoria
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear la categoría',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async generateAnalysisReport(): Promise<ActionResult> {
    try {
      const [reportesPorEstado, reportesPorCategoria, reportesPorPrioridad] = await Promise.all([
        supabase.from('reportes')
          .select(`
            estado_id,
            estados(nombre, color)
          `),
        supabase.from('reportes')
          .select(`
            categoria_id,
            categories(nombre, color)
          `),
        supabase.from('reportes')
          .select('priority')
      ]);

      const estadosStats = this.processGroupedData(reportesPorEstado.data, 'estados', 'nombre');
      const categoriasStats = this.processGroupedData(reportesPorCategoria.data, 'categories', 'nombre');
      const prioridadStats = this.processPriorityData(reportesPorPrioridad.data);

      return {
        success: true,
        message: 'Reporte de análisis generado',
        data: {
          porEstado: estadosStats,
          porCategoria: categoriasStats,
          porPrioridad: prioridadStats
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al generar el reporte de análisis',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private processGroupedData(data: any[], groupKey: string, nameKey: string) {
    const grouped = data.reduce((acc, item) => {
      const key = item[groupKey]?.[nameKey] || 'Sin clasificar';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, count]) => ({
      name,
      count: count as number
    }));
  }

  private processPriorityData(data: any[]) {
    const grouped = data.reduce((acc, item) => {
      const priority = item.priority || 'sin_prioridad';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([priority, count]) => ({
      priority,
      count: count as number
    }));
  }
}

export const assistantActionService = AssistantActionService.getInstance();
