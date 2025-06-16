
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Calendar, Shield, Activity, History, Eye, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UsuarioCambiosRecibidos } from './UsuarioCambiosRecibidos';
import { UsuarioAuditoria } from './UsuarioAuditoria';

interface UsuarioLogueadoDetalleProps {
  onClose: () => void;
}

interface PerfilUsuario {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  role: string[];
  created_at: string;
  updated_at: string;
}

export const UsuarioLogueadoDetalle: React.FC<UsuarioLogueadoDetalleProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');

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

      return data as PerfilUsuario;
    },
    enabled: !!user?.id,
  });

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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mi Perfil</h1>
                <p className="text-muted-foreground">
                  Información personal y actividad en el sistema
                </p>
              </div>
            </div>
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </div>

          {/* Tabs de navegación */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="perfil" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="actividad" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Mi Actividad
              </TabsTrigger>
              <TabsTrigger value="auditoria" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Cambios en mi Cuenta
              </TabsTrigger>
            </TabsList>

            {/* Contenido de las pestañas */}
            <TabsContent value="perfil">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                        <p className="text-lg font-medium">
                          {perfilUsuario.first_name} {perfilUsuario.last_name}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Correo Electrónico
                        </label>
                        <p className="text-lg">{perfilUsuario.email}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Roles
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {perfilUsuario.role?.map((rol, index) => (
                            <Badge key={index} variant="secondary">
                              {rol}
                            </Badge>
                          )) || <span className="text-muted-foreground">Sin roles asignados</span>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Fecha de Registro
                        </label>
                        <p className="text-lg">
                          {format(new Date(perfilUsuario.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Última Actualización
                        </label>
                        <p className="text-lg">
                          {format(new Date(perfilUsuario.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          ID de Usuario
                        </label>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {perfilUsuario.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actividad">
              <UsuarioCambiosRecibidos 
                usuarioId={perfilUsuario.id} 
                usuarioEmail={perfilUsuario.email} 
              />
            </TabsContent>

            <TabsContent value="auditoria">
              <UsuarioAuditoria 
                usuarioId={perfilUsuario.id} 
                usuarioEmail={perfilUsuario.email} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
