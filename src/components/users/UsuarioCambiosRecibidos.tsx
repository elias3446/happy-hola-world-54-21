
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserCheck, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UsuarioCambiosRecibidosProps {
  usuarioId: string;
  usuarioEmail: string;
}

interface CambioEnUsuario {
  id: string;
  tabla_nombre: string;
  registro_id: string;
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
  valores_anteriores: any;
  valores_nuevos: any;
  campos_modificados: string[];
  descripcion_cambio: string;
  created_at: string;
  user_email: string;
}

export const UsuarioCambiosRecibidos: React.FC<UsuarioCambiosRecibidosProps> = ({ 
  usuarioId, 
  usuarioEmail 
}) => {
  // Hook para obtener cambios realizados EN el usuario (en su perfil, asignaciones, etc.)
  const { data: cambiosEnUsuario = [], isLoading: isLoadingCambiosEnUsuario } = useQuery({
    queryKey: ['usuario-cambios-recibidos', usuarioId],
    queryFn: async () => {
      console.log('Fetching changes made TO user:', usuarioId);
      
      const { data, error } = await supabase.rpc('get_change_history', {
        p_tabla_nombre: null,
        p_registro_id: usuarioId,
        p_user_id: null,
        p_limit: 100,
        p_offset: 0
      });

      if (error) {
        console.error('Error fetching cambios en usuario:', error);
        throw error;
      }

      console.log('Fetched changes made TO user:', data);
      
      // Filtrar solo cambios relevantes al usuario
      const cambiosRelevantes = (data || []).filter((cambio: CambioEnUsuario) => {
        return (
          // Cambios en el perfil del usuario
          (cambio.tabla_nombre === 'profiles' && cambio.registro_id === usuarioId) ||
          // Cambios en asignaciones de roles del usuario
          (cambio.tabla_nombre === 'user_roles' && 
           (cambio.valores_anteriores?.user_id === usuarioId || cambio.valores_nuevos?.user_id === usuarioId)) ||
          // Cambios en reportes asignados al usuario
          (cambio.tabla_nombre === 'reportes' && 
           (cambio.valores_anteriores?.assigned_to === usuarioId || cambio.valores_nuevos?.assigned_to === usuarioId))
        );
      });

      return cambiosRelevantes as CambioEnUsuario[];
    },
    enabled: !!usuarioId,
  });

  const getDescripcionCambio = (cambio: CambioEnUsuario) => {
    if (cambio.tabla_nombre === 'profiles') {
      return `Cambio en perfil de usuario`;
    } else if (cambio.tabla_nombre === 'user_roles') {
      if (cambio.operation_type === 'INSERT') {
        return `Rol asignado al usuario`;
      } else if (cambio.operation_type === 'DELETE') {
        return `Rol removido del usuario`;
      } else {
        return `Cambio en rol del usuario`;
      }
    } else if (cambio.tabla_nombre === 'reportes') {
      if (cambio.valores_anteriores?.assigned_to !== usuarioId && cambio.valores_nuevos?.assigned_to === usuarioId) {
        return `Reporte asignado al usuario`;
      } else if (cambio.valores_anteriores?.assigned_to === usuarioId && cambio.valores_nuevos?.assigned_to !== usuarioId) {
        return `Reporte desasignado del usuario`;
      } else {
        return `Cambio en reporte asignado`;
      }
    }
    return cambio.descripcion_cambio;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">Cambios en {usuarioEmail}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Cambios realizados en el perfil, roles y asignaciones de este usuario
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {isLoadingCambiosEnUsuario ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : cambiosEnUsuario.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron cambios realizados en este usuario
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Operación</TableHead>
                    <TableHead className="min-w-[200px]">Descripción</TableHead>
                    <TableHead className="w-[120px]">Tabla</TableHead>
                    <TableHead className="w-[150px]">Realizado por</TableHead>
                    <TableHead className="w-[120px]">Campos</TableHead>
                    <TableHead className="w-[120px]">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cambiosEnUsuario.map((cambio) => (
                    <TableRow key={cambio.id}>
                      <TableCell className="p-2">
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            cambio.operation_type === 'INSERT' ? 'bg-green-100 text-green-800 border-green-200' :
                            cambio.operation_type === 'UPDATE' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            cambio.operation_type === 'DELETE' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }`}
                        >
                          {cambio.operation_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="max-w-[200px] truncate text-sm" title={getDescripcionCambio(cambio)}>
                          {getDescripcionCambio(cambio)}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="text-xs text-muted-foreground truncate">
                          {cambio.tabla_nombre}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-1 max-w-[120px]">
                          <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs truncate">{cambio.user_email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        {cambio.campos_modificados && cambio.campos_modificados.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[100px]">
                            {cambio.campos_modificados.slice(0, 1).map((campo, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {campo}
                              </Badge>
                            ))}
                            {cambio.campos_modificados.length > 1 && (
                              <Badge variant="secondary" className="text-xs">
                                +{cambio.campos_modificados.length - 1}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {format(new Date(cambio.created_at), 'dd/MM/yy HH:mm', { locale: es })}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
