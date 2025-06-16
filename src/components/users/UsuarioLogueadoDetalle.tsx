import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Calendar, Shield, Activity, History, Eye, X, Edit, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UsuarioCambiosRecibidos } from './UsuarioCambiosRecibidos';
import { UsuarioAuditoria } from './UsuarioAuditoria';
import { UsuarioLogueadoEdit } from './UsuarioLogueadoEdit';
import { UsuarioEstadisticasActividad } from './UsuarioEstadisticasActividad';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useIsMobile();

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

  // Si está en modo edición, mostrar el componente de edición
  if (isEditing) {
    return (
      <UsuarioLogueadoEdit 
        onClose={onClose}
        onBack={() => setIsEditing(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!perfilUsuario) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
      <div className="container mx-auto px-4 py-4 sm:py-6 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex-shrink-0">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold truncate">Mi Perfil</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Información personal y actividad en el sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => setIsEditing(true)} 
                variant="outline" 
                size={isMobile ? "sm" : "sm"}
                className="flex-1 sm:flex-none"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                onClick={onClose} 
                variant="outline" 
                size={isMobile ? "sm" : "sm"}
                className="flex-1 sm:flex-none"
              >
                <X className="h-4 w-4 mr-2" />
                Cerrar
              </Button>
            </div>
          </div>

          {/* Tabs de navegación */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
              <TabsTrigger value="perfil" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="actividad" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Actividad</span>
              </TabsTrigger>
              <TabsTrigger value="estadisticas" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Estadísticas</span>
              </TabsTrigger>
              <TabsTrigger value="auditoria" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Cambios</span>
              </TabsTrigger>
            </TabsList>

            {/* Contenido de las pestañas */}
            <TabsContent value="perfil">
              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                        <p className="text-base sm:text-lg font-medium break-words">
                          {perfilUsuario.first_name} {perfilUsuario.last_name}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Correo Electrónico
                        </label>
                        <p className="text-base sm:text-lg break-all">{perfilUsuario.email}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Roles
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {perfilUsuario.role?.map((rol, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {rol}
                            </Badge>
                          )) || <span className="text-muted-foreground text-sm">Sin roles asignados</span>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Fecha de Registro
                        </label>
                        <p className="text-base sm:text-lg">
                          {format(new Date(perfilUsuario.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Última Actualización
                        </label>
                        <p className="text-base sm:text-lg">
                          {format(new Date(perfilUsuario.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          ID de Usuario
                        </label>
                        <p className="text-xs sm:text-sm font-mono bg-muted px-2 py-1 rounded break-all">
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

            <TabsContent value="estadisticas">
              <UsuarioEstadisticasActividad 
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
