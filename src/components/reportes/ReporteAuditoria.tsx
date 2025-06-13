
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity, History, Clock, User, Database, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReporteAuditoriaProps {
  reporteId: string;
}

interface ActividadReporte {
  id: string;
  activity_type: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SEARCH' | 'EXPORT' | 'IMPORT';
  descripcion: string;
  tabla_afectada: string | null;
  registro_id: string | null;
  metadatos: any;
  created_at: string;
  user_email: string;
}

interface CambioReporte {
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

const getActivityIcon = (type: ActividadReporte['activity_type']) => {
  switch (type) {
    case 'CREATE': return <Activity className="h-4 w-4 text-green-600" />;
    case 'READ': return <FileText className="h-4 w-4 text-blue-600" />;
    case 'UPDATE': return <Activity className="h-4 w-4 text-orange-600" />;
    case 'DELETE': return <Activity className="h-4 w-4 text-red-600" />;
    case 'LOGIN': return <User className="h-4 w-4 text-purple-600" />;
    case 'LOGOUT': return <User className="h-4 w-4 text-gray-600" />;
    case 'SEARCH': return <FileText className="h-4 w-4 text-indigo-600" />;
    case 'EXPORT': return <Database className="h-4 w-4 text-teal-600" />;
    case 'IMPORT': return <Database className="h-4 w-4 text-cyan-600" />;
    default: return <Activity className="h-4 w-4 text-gray-600" />;
  }
};

const getActivityColor = (type: ActividadReporte['activity_type']) => {
  switch (type) {
    case 'CREATE': return 'bg-green-100 text-green-800 border-green-200';
    case 'READ': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'UPDATE': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
    case 'LOGIN': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'LOGOUT': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'SEARCH': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'EXPORT': return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'IMPORT': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const ReporteAuditoria: React.FC<ReporteAuditoriaProps> = ({ reporteId }) => {
  // Hook para obtener actividades relacionadas al reporte
  const { data: actividades = [], isLoading: isLoadingActividades } = useQuery({
    queryKey: ['reporte-actividades', reporteId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_activities', {
        p_user_id: null,
        p_limit: 100,
        p_offset: 0
      });

      if (error) {
        console.error('Error fetching reporte actividades:', error);
        throw error;
      }

      // Filtrar actividades relacionadas al reporte específico
      return (data as ActividadReporte[]).filter(actividad => 
        actividad.tabla_afectada === 'reportes' && 
        actividad.registro_id === reporteId
      );
    }
  });

  // Hook para obtener historial de cambios del reporte
  const { data: cambios = [], isLoading: isLoadingCambios } = useQuery({
    queryKey: ['reporte-cambios', reporteId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_change_history', {
        p_tabla_nombre: 'reportes',
        p_registro_id: reporteId,
        p_user_id: null,
        p_limit: 100,
        p_offset: 0
      });

      if (error) {
        console.error('Error fetching reporte cambios:', error);
        throw error;
      }

      return data as CambioReporte[];
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Auditoría del Reporte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="actividades" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="actividades" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Actividades ({actividades.length})
            </TabsTrigger>
            <TabsTrigger value="cambios" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial de Cambios ({cambios.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="actividades" className="mt-4">
            <ScrollArea className="h-[300px]">
              {isLoadingActividades ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : actividades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron actividades para este reporte
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actividades.map((actividad) => (
                      <TableRow key={actividad.id}>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getActivityColor(actividad.activity_type)}
                          >
                            <div className="flex items-center gap-1">
                              {getActivityIcon(actividad.activity_type)}
                              <span className="text-xs">{actividad.activity_type}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate" title={actividad.descripcion}>
                            {actividad.descripcion}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{actividad.user_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(actividad.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="cambios" className="mt-4">
            <ScrollArea className="h-[300px]">
              {isLoadingCambios ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : cambios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron cambios registrados para este reporte
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operación</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Campos Modificados</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cambios.map((cambio) => (
                      <TableRow key={cambio.id}>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              cambio.operation_type === 'INSERT' ? 'bg-green-100 text-green-800 border-green-200' :
                              cambio.operation_type === 'UPDATE' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              cambio.operation_type === 'DELETE' ? 'bg-red-100 text-red-800 border-red-200' :
                              'bg-blue-100 text-blue-800 border-blue-200'
                            }
                          >
                            {cambio.operation_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate" title={cambio.descripcion_cambio}>
                            {cambio.descripcion_cambio}
                          </div>
                        </TableCell>
                        <TableCell>
                          {cambio.campos_modificados && cambio.campos_modificados.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {cambio.campos_modificados.slice(0, 3).map((campo, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {campo}
                                </Badge>
                              ))}
                              {cambio.campos_modificados.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{cambio.campos_modificados.length - 3} más
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{cambio.user_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(cambio.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
