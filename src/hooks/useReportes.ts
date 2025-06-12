
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Reporte, CreateReporteData, UpdateReporteData } from '@/types/reportes';

export const useReportes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: reportes = [], isLoading, error } = useQuery({
    queryKey: ['reportes'],
    queryFn: async () => {
      console.log('Fetching reportes...');
      const { data, error } = await supabase
        .from('reportes')
        .select(`
          *,
          categoria:categories!reportes_categoria_id_fkey(id, nombre, color, icono, deleted_at),
          estado:estados!reportes_estado_id_fkey(id, nombre, color, icono, deleted_at),
          created_by_profile:profiles!reportes_created_by_fkey(id, first_name, last_name, email),
          assigned_to_profile:profiles!reportes_assigned_to_fkey(id, first_name, last_name, email)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reportes:', error);
        throw error;
      }

      console.log('Reportes fetched:', data);
      return data as Reporte[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateReporteData) => {
      if (!user) throw new Error('Usuario no autenticado');

      console.log('Creating reporte:', data);
      
      const { data: result, error } = await supabase
        .from('reportes')
        .insert({
          ...data,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reporte:', error);
        throw error;
      }

      console.log('Reporte created:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success('Reporte creado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creating reporte:', error);
      toast.error(error.message || 'Error al crear el reporte');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateReporteData) => {
      console.log('Updating reporte:', data);
      const { id, ...updateData } = data;
      
      const { data: result, error } = await supabase
        .from('reportes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reporte:', error);
        throw error;
      }

      console.log('Reporte updated:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success('Reporte actualizado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error updating reporte:', error);
      toast.error(error.message || 'Error al actualizar el reporte');
    },
  });

  const updateReporteImages = async (reporteId: string, imageUrls: string[]) => {
    const { error } = await supabase
      .from('reportes')
      .update({ imagenes: imageUrls })
      .eq('id', reporteId);

    if (error) {
      console.error('Error updating reporte images:', error);
      throw error;
    }

    queryClient.invalidateQueries({ queryKey: ['reportes'] });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Soft deleting reporte:', id);
      const { error } = await supabase
        .from('reportes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error deleting reporte:', error);
        throw error;
      }

      console.log('Reporte deleted:', id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success('Reporte eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error deleting reporte:', error);
      toast.error(error.message || 'Error al eliminar el reporte');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      console.log('Toggling reporte status:', { id, activo });
      const { error } = await supabase
        .from('reportes')
        .update({ activo })
        .eq('id', id);

      if (error) {
        console.error('Error toggling reporte status:', error);
        throw error;
      }

      console.log('Reporte status toggled:', { id, activo });
      return { id, activo };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success('Estado del reporte actualizado');
    },
    onError: (error: any) => {
      console.error('Error toggling reporte status:', error);
      toast.error(error.message || 'Error al cambiar el estado del reporte');
    },
  });

  // Nuevas mutaciones para acciones masivas
  const bulkToggleStatusMutation = useMutation({
    mutationFn: async (reporteIds: string[]) => {
      console.log('Bulk toggling status for reportes:', reporteIds);
      
      // Obtener el estado actual de cada reporte para hacer el toggle
      const { data: currentReportes, error: fetchError } = await supabase
        .from('reportes')
        .select('id, activo')
        .in('id', reporteIds);

      if (fetchError) throw fetchError;

      // Crear las actualizaciones individuales
      const updates = currentReportes.map(reporte => 
        supabase
          .from('reportes')
          .update({ activo: !reporte.activo })
          .eq('id', reporte.id)
      );

      const results = await Promise.all(updates);
      
      // Verificar si alguna actualización falló
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Error al actualizar ${errors.length} reportes`);
      }

      return reporteIds;
    },
    onSuccess: (reporteIds) => {
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success(`Estado actualizado para ${reporteIds.length} reportes`);
    },
    onError: (error: any) => {
      console.error('Error bulk toggling status:', error);
      toast.error(error.message || 'Error al cambiar el estado de los reportes');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (reporteIds: string[]) => {
      console.log('Bulk deleting reportes:', reporteIds);
      const { error } = await supabase
        .from('reportes')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', reporteIds);

      if (error) {
        console.error('Error bulk deleting reportes:', error);
        throw error;
      }

      return reporteIds;
    },
    onSuccess: (reporteIds) => {
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success(`${reporteIds.length} reportes eliminados exitosamente`);
    },
    onError: (error: any) => {
      console.error('Error bulk deleting reportes:', error);
      toast.error(error.message || 'Error al eliminar los reportes');
    },
  });

  const bulkChangeCategoryMutation = useMutation({
    mutationFn: async ({ reporteIds, categoryId }: { reporteIds: string[]; categoryId: string }) => {
      console.log('Bulk changing category for reportes:', reporteIds, 'to:', categoryId);
      const { error } = await supabase
        .from('reportes')
        .update({ categoria_id: categoryId })
        .in('id', reporteIds);

      if (error) {
        console.error('Error bulk changing category:', error);
        throw error;
      }

      return { reporteIds, categoryId };
    },
    onSuccess: ({ reporteIds }) => {
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success(`Categoría actualizada para ${reporteIds.length} reportes`);
    },
    onError: (error: any) => {
      console.error('Error bulk changing category:', error);
      toast.error(error.message || 'Error al cambiar la categoría de los reportes');
    },
  });

  const bulkChangeEstadoMutation = useMutation({
    mutationFn: async ({ reporteIds, estadoId }: { reporteIds: string[]; estadoId: string }) => {
      console.log('Bulk changing estado for reportes:', reporteIds, 'to:', estadoId);
      const { error } = await supabase
        .from('reportes')
        .update({ estado_id: estadoId })
        .in('id', reporteIds);

      if (error) {
        console.error('Error bulk changing estado:', error);
        throw error;
      }

      return { reporteIds, estadoId };
    },
    onSuccess: ({ reporteIds }) => {
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success(`Estado actualizado para ${reporteIds.length} reportes`);
    },
    onError: (error: any) => {
      console.error('Error bulk changing estado:', error);
      toast.error(error.message || 'Error al cambiar el estado de los reportes');
    },
  });

  const bulkChangeAssignmentMutation = useMutation({
    mutationFn: async ({ reporteIds, userId }: { reporteIds: string[]; userId: string | null }) => {
      console.log('Bulk changing assignment for reportes:', reporteIds, 'to:', userId);
      const { error } = await supabase
        .from('reportes')
        .update({ assigned_to: userId })
        .in('id', reporteIds);

      if (error) {
        console.error('Error bulk changing assignment:', error);
        throw error;
      }

      return { reporteIds, userId };
    },
    onSuccess: ({ reporteIds, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      const message = userId 
        ? `Asignación actualizada para ${reporteIds.length} reportes`
        : `${reporteIds.length} reportes desasignados`;
      toast.success(message);
    },
    onError: (error: any) => {
      console.error('Error bulk changing assignment:', error);
      toast.error(error.message || 'Error al cambiar la asignación de los reportes');
    },
  });

  return {
    reportes,
    isLoading,
    error,
    createReporte: createMutation.mutate,
    updateReporte: updateMutation.mutate,
    updateReporteImages,
    deleteReporte: deleteMutation.mutate,
    toggleReporteStatus: toggleStatusMutation.mutate,
    bulkToggleStatus: bulkToggleStatusMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    bulkChangeCategory: bulkChangeCategoryMutation.mutate,
    bulkChangeEstado: bulkChangeEstadoMutation.mutate,
    bulkChangeAssignment: bulkChangeAssignmentMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isBulkToggling: bulkToggleStatusMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkChangingCategory: bulkChangeCategoryMutation.isPending,
    isBulkChangingEstado: bulkChangeEstadoMutation.isPending,
    isBulkChangingAssignment: bulkChangeAssignmentMutation.isPending,
  };
};
