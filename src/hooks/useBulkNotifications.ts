
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Notification } from '@/types/notifications';
import { useBulkSelection } from '@/hooks/useBulkSelection';

export const useBulkNotifications = (notifications: Notification[]) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const bulkSelection = useBulkSelection(notifications);

  const deleteBulkNotificationsMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, notificationIds) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      bulkSelection.clearSelection();
      toast({
        title: 'Éxito',
        description: `${notificationIds.length} notificaciones eliminadas`,
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar las notificaciones',
        variant: 'destructive',
      });
    },
  });

  const markBulkAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds)
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: (_, notificationIds) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      bulkSelection.clearSelection();
      toast({
        title: 'Éxito',
        description: `${notificationIds.length} notificaciones marcadas como leídas`,
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al marcar las notificaciones como leídas',
        variant: 'destructive',
      });
    },
  });

  const deleteBulkNotifications = useCallback(() => {
    const selectedIds = Array.from(bulkSelection.selectedItems);
    if (selectedIds.length > 0) {
      deleteBulkNotificationsMutation.mutate(selectedIds);
    }
  }, [bulkSelection.selectedItems, deleteBulkNotificationsMutation]);

  const markBulkAsRead = useCallback(() => {
    const selectedIds = Array.from(bulkSelection.selectedItems);
    const unreadIds = selectedIds.filter(id => {
      const notification = notifications.find(n => n.id === id);
      return notification && !notification.read;
    });
    
    if (unreadIds.length > 0) {
      markBulkAsReadMutation.mutate(unreadIds);
    }
  }, [bulkSelection.selectedItems, notifications, markBulkAsReadMutation]);

  return {
    ...bulkSelection,
    deleteBulkNotifications,
    markBulkAsRead,
    isDeleting: deleteBulkNotificationsMutation.isPending,
    isMarkingAsRead: markBulkAsReadMutation.isPending,
  };
};
