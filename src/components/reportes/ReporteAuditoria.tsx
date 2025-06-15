
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity, History, Clock, User, Database, FileText, Search, Filter, Download, Calendar } from 'lucide-react';
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
  const [filtroTipo, setFiltroTipo] = useState<string>('all');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('');
  const [filtroFecha, setFiltroFecha] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');

  // Hook para obtener actividades relacionadas al reporte
  const { data: actividades = [], isLoading: isLoadingActividades } = useQuery({
    queryKey: ['reporte-actividades', reporteId, filtroTipo, filtroUsuario, filtroFecha, busqueda],
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
      let filteredData = (data as ActividadReporte[]).filter(actividad => 
        actividad.tabla_afectada === 'reportes' && 
        actividad.registro_id === reporteId
      );

      // Aplicar filtros
      if (filtroTipo && filtroTipo !== 'all') {
        filteredData = filteredData.filter(a => a.activity_type === filtroTipo);
      }
      if (filtroUsuario) {
        filteredData = filteredData.filter(a => a.user_email.toLowerCase().includes(filtroUsuario.toLowerCase()));
      }
      if (busqueda) {
        filteredData = filteredData.filter(a => 
          a.descripcion.toLowerCase().includes(busqueda.toLowerCase())
        );
      }

      return filteredData;
    }
  });

  // Hook para obtener historial de cambios del reporte
  const { data: cambios = [], isLoading: isLoadingCambios } = useQuery({
    queryKey: ['reporte-cambios', reporteId, filtroTipo, filtroUsuario, filtroFecha, busqueda],
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

      let filteredData = data as CambioReporte[];

      // Aplicar filtros
      if (filtroTipo && filtroTipo !== 'all') {
        filteredData = filteredData.filter(c => c.operation_type === filtroTipo);
      }
      if (filtroUsuario) {
        filteredData = filteredData.filter(c => c.user_email.toLowerCase().includes(filtroUsuario.toLowerCase()));
      }
      if (busqueda) {
        filteredData = filteredData.filter(c => 
          c.descripcion_cambio.toLowerCase().includes(busqueda.toLowerCase())
        );
      }

      return filteredData;
    }
  });

  const limpiarFiltros = () => {
    setFiltroTipo('all');
    setFiltroUsuario('');
    setFiltroFecha('');
    setBusqueda('');
  };

  const exportarDatos = () => {
    console.log('Exportar datos de auditoría del reporte');
  };

  return (
    <div className="space-y-6">
      {/* Header con título y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Auditoría del Reporte
          </h2>
          <p className="text-muted-foreground mt-1">
            Historial completo de actividades y cambios registrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportarDatos}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Actividad</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="CREATE">Crear</SelectItem>
                  <SelectItem value="READ">Leer</SelectItem>
                  <SelectItem value="UPDATE">Actualizar</SelectItem>
                  <SelectItem value="DELETE">Eliminar</SelectItem>
                  <SelectItem value="LOGIN">Inicio de sesión</SelectItem>
                  <SelectItem value="LOGOUT">Cierre de sesión</SelectItem>
                  <SelectItem value="SEARCH">Búsqueda</SelectItem>
                  <SelectItem value="EXPORT">Exportar</SelectItem>
                  <SelectItem value="IMPORT">Importar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>
              <Input
                placeholder="Filtrar por email..."
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={limpiarFiltros}>
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal con tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="actividades" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="actividades" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Actividades</span>
                <Badge variant="secondary" className="ml-2">
                  {actividades.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="cambios" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Cambios</span>
                <Badge variant="secondary" className="ml-2">
                  {cambios.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="actividades" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Registro de Actividades</h3>
                <div className="text-sm text-muted-foreground">
                  {isLoadingActividades ? 'Cargando...' : `${actividades.length} registros encontrados`}
                </div>
              </div>
              
              <div className="border rounded-lg">
                <ScrollArea className="h-[400px]">
                  {isLoadingActividades ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : actividades.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No se encontraron actividades</p>
                      <p className="text-sm">No hay actividades registradas para este reporte con los filtros aplicados.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead className="w-[120px]">Tipo</TableHead>
                          <TableHead className="min-w-[300px]">Descripción</TableHead>
                          <TableHead className="w-[180px]">Usuario</TableHead>
                          <TableHead className="w-[150px]">Fecha y Hora</TableHead>
                          <TableHead className="w-[100px]">Tabla</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {actividades.map((actividad) => (
                          <TableRow key={actividad.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={`${getActivityColor(actividad.activity_type)} text-xs font-medium`}
                              >
                                <div className="flex items-center gap-1">
                                  {getActivityIcon(actividad.activity_type)}
                                  <span>{actividad.activity_type}</span>
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[300px]">
                                <p className="text-sm font-medium truncate" title={actividad.descripcion}>
                                  {actividad.descripcion}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium truncate" title={actividad.user_email}>
                                  {actividad.user_email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {format(new Date(actividad.created_at), 'dd/MM/yyyy', { locale: es })}
                                  </div>
                                  <div className="text-xs">
                                    {format(new Date(actividad.created_at), 'HH:mm:ss', { locale: es })}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {actividad.tabla_afectada || 'N/A'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="cambios" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Historial de Cambios</h3>
                <div className="text-sm text-muted-foreground">
                  {isLoadingCambios ? 'Cargando...' : `${cambios.length} registros encontrados`}
                </div>
              </div>

              <div className="border rounded-lg">
                <ScrollArea className="h-[400px]">
                  {isLoadingCambios ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : cambios.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No se encontraron cambios</p>
                      <p className="text-sm">No hay cambios registrados para este reporte con los filtros aplicados.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead className="w-[120px]">Operación</TableHead>
                          <TableHead className="min-w-[300px]">Descripción del Cambio</TableHead>
                          <TableHead className="w-[200px]">Campos Modificados</TableHead>
                          <TableHead className="w-[180px]">Usuario</TableHead>
                          <TableHead className="w-[150px]">Fecha y Hora</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cambios.map((cambio) => (
                          <TableRow key={cambio.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={`text-xs font-medium ${
                                  cambio.operation_type === 'INSERT' ? 'bg-green-100 text-green-800 border-green-200' :
                                  cambio.operation_type === 'UPDATE' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                  cambio.operation_type === 'DELETE' ? 'bg-red-100 text-red-800 border-red-200' :
                                  'bg-blue-100 text-blue-800 border-blue-200'
                                }`}
                              >
                                {cambio.operation_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[300px]">
                                <p className="text-sm font-medium truncate" title={cambio.descripcion_cambio}>
                                  {cambio.descripcion_cambio}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {cambio.campos_modificados && cambio.campos_modificados.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-[180px]">
                                  {cambio.campos_modificados.slice(0, 3).map((campo, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {campo}
                                    </Badge>
                                  ))}
                                  {cambio.campos_modificados.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{cambio.campos_modificados.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">Sin campos</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium truncate" title={cambio.user_email}>
                                  {cambio.user_email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {format(new Date(cambio.created_at), 'dd/MM/yyyy', { locale: es })}
                                  </div>
                                  <div className="text-xs">
                                    {format(new Date(cambio.created_at), 'HH:mm:ss', { locale: es })}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
