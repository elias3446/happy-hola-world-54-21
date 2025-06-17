
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Notification, UpdateNotificationData } from '@/types/notifications';

// Global subscription manager to prevent multiple subscriptions
const subscriptionManager = {
  channel: null as any,
  subscriberCount: 0,
  currentUserId: null as string | null,
};

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const isSubscribed = useRef(false);

  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });

  // Actualizar contador de no leídas
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Suscribirse a notificaciones en tiempo real usando singleton pattern
  useEffect(() => {
    if (!user || isSubscribed.current) return;

    // Increment subscriber count
    subscriptionManager.subscriberCount++;
    isSubscribed.current = true;

    // If this is the first subscriber or user changed, create/recreate subscription
    if (subscriptionManager.subscriberCount === 1 || subscriptionManager.currentUserId !== user.id) {
      // Clean up existing subscription if user changed
      if (subscriptionManager.channel && subscriptionManager.currentUserId !== user.id) {
        console.log('User changed, cleaning up old subscription');
        supabase.removeChannel(subscriptionManager.channel);
        subscriptionManager.channel = null;
      }

      // Create new subscription
      if (!subscriptionManager.channel) {
        const channelName = `notifications-${user.id}-${Date.now()}`;
        subscriptionManager.currentUserId = user.id;
        
        console.log('Creating new notifications subscription for user:', user.id);
        
        subscriptionManager.channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log('Notification change:', payload);
              queryClient.invalidateQueries({ queryKey: ['notifications'] });
              
              // Mostrar toast para nuevas notificaciones
              if (payload.eventType === 'INSERT') {
                const newNotification = payload.new as Notification;
                toast({
                  title: newNotification.title,
                  description: newNotification.message,
                  variant: 'default',
                });
              }
            }
          )
          .subscribe((status) => {
            console.log('Subscription status:', status);
          });
      }
    }

    return () => {
      isSubscribed.current = false;
      subscriptionManager.subscriberCount--;
      
      console.log('Cleaning up notifications subscription, remaining subscribers:', subscriptionManager.subscriberCount);
      
      // Only remove channel when no more subscribers
      if (subscriptionManager.subscriberCount === 0 && subscriptionManager.channel) {
        console.log('Removing notifications channel - no more subscribers');
        supabase.removeChannel(subscriptionManager.channel);
        subscriptionManager.channel = null;
        subscriptionManager.currentUserId = null;
      }
    };
  }, [user?.id, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al marcar como leída',
        variant: 'destructive',
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Éxito',
        description: 'Todas las notificaciones marcadas como leídas',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al marcar todas como leídas',
        variant: 'destructive',
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Éxito',
        description: 'Notificación eliminada',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar la notificación',
        variant: 'destructive',
      });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
};
