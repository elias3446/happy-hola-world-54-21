
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User, Save, X, ArrowLeft } from 'lucide-react';
import { isValidEmail } from '@/utils/validations';
import { useToast } from '@/hooks/use-toast';

interface UsuarioLogueadoEditProps {
  onClose: () => void;
  onBack: () => void;
}

const editUserSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  email: z.string()
    .min(1, 'El email es requerido')
    .refine((email) => isValidEmail(email), {
      message: 'Debe ser un email válido según RFC 5322'
    }),
});

type EditFormData = z.infer<typeof editUserSchema>;

export const UsuarioLogueadoEdit: React.FC<UsuarioLogueadoEditProps> = ({ onClose, onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener datos del perfil del usuario logueado
  const { data: perfilUsuario, isLoading } = useQuery({
    queryKey: ['perfil-usuario-logueado', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const form = useForm<EditFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      first_name: perfilUsuario?.first_name || '',
      last_name: perfilUsuario?.last_name || '',
      email: perfilUsuario?.email || '',
    },
  });

  // Actualizar valores del formulario cuando se cargan los datos
  React.useEffect(() => {
    if (perfilUsuario) {
      form.reset({
        first_name: perfilUsuario.first_name || '',
        last_name: perfilUsuario.last_name || '',
        email: perfilUsuario.email || '',
      });
    }
  }, [perfilUsuario, form]);

  // Mutación para actualizar el perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: EditFormData) => {
      if (!user?.id) throw new Error('Usuario no encontrado');

      // Actualizar en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      // Si el email cambió, actualizar en auth.users también
      if (data.email !== perfilUsuario?.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: data.email
        });

        if (authError) {
          console.error('Error updating auth email:', authError);
          throw authError;
        }
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "Tu información personal ha sido actualizada correctamente.",
      });
      
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['perfil-usuario-logueado'] });
      
      // Volver a la vista de detalle
      onBack();
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: EditFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!perfilUsuario) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No se pudo cargar la información del usuario.</p>
            <Button onClick={onClose} className="mt-4">
              Cerrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-auto">
      <div className="container mx-auto px-4 py-6 min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Editar Mi Perfil</h1>
                  <p className="text-muted-foreground">
                    Actualiza tu información personal
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </div>

          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingresa tu nombre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingresa tu apellido" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="tu@email.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                        {form.watch('email') !== perfilUsuario?.email && (
                          <p className="text-sm text-muted-foreground">
                            ⚠️ Al cambiar tu email, recibirás un correo de confirmación.
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onBack}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
