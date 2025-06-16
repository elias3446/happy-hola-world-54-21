
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity, History, Clock, User, Database, FileText, Search, Filter, RefreshCw, Download, Shield, Eye, Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CambioDetalleModal } from '../roles/dialogs/CambioDetalleModal';

interface UsuarioAuditoriaProps {
  usuarioId: string;
  usuarioEmail: string;
}

interface ActividadUsuario {
  id: string;
  activity_type: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SEARCH' | 'EXPORT' | 'IMPORT';
  descripcion: string;
  tabla_afectada: string | null;
  registro_id: string | null;
  metadatos: any;
  created_at: string;
  user_email: string;
}

interface CambioUsuario {
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

const getActivityIcon = (type: ActividadUsuario['activity_type']) => {
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

const getActivityColor = (type: ActividadUsuario['activity_type']) => {
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

const getOperationColor = (operation: CambioUsuario['operation_type']) => {
  switch (operation) {
    case 'INSERT': return 'bg-green-100 text-green-800 border-green-200';
    case 'UPDATE': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
    case 'SELECT': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const UsuarioAuditoria: React.FC<UsuarioAuditoriaProps> = ({ usuarioId, usuarioEmail }) => {
  const [filtroTipo, setFiltroTipo] = useState<string>('all');
  const [busqueda, setBusqueda] = useState<string>('');
  const [activeTab, setActiveTab] = useState('actividades');
  const [selectedCambio, setSelectedCambio] = useState<CambioUsuario | null>(null);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);

  // Hook para obtener actividades realizadas POR el usuario
  const { data: actividades = [], isLoading: isLoadingActividades } = useQuery({
    queryKey: ['usuario-actividades-propias', usuarioId, filtroTipo, busqueda],
    queryFn: async () => {
      console.log('Fetching activities performed BY user:', usuarioId);
      
      const { data, error } = await supabase.rpc('get_user_activities', {
        p_user_id: usuarioId,
        p_limit: 100,
        p_offset: 0
      });

      if (error) {
        console.error('Error fetching usuario actividades:', error);
        throw error;
      }

      console.log('Fetched activities performed BY user:', data);

      let actividadesFiltradas = (data as ActividadUsuario[]) || [];

      // Aplicar filtros
      if (filtroTipo && filtroTipo !== 'all') {
        actividadesFiltradas = actividadesFiltradas.filter(a => a.activity_type === filtroTipo);
      }
      if (busqueda) {
        actividadesFiltradas = actividadesFiltradas.filter(a => 
          a.descripcion.toLowerCase().includes(busqueda.toLowerCase())
        );
      }

      return actividadesFiltradas;
    },
    enabled: !!usuarioId,
  });

  // Hook para obtener cambios realizados EN el usuario
  const { data: cambios = [], isLoading: isLoadingCambios } = useQuery({
    queryKey: ['usuario-cambios-recibidos', usuarioId, filtroTipo, busqueda],
    queryFn: async () => {
      console.log('Fetching changes made TO user:', usuarioId);
      
      // Obtener cambios en el perfil del usuario
      const { data: cambiosPerfil, error: errorPerfil } = await supabase.rpc('get_change_history', {
        p_tabla_nombre: 'profiles',
        p_registro_id: usuarioId,
        p_user_id: null,
        p_limit: 100,
        p_offset: 0
      });

      if (errorPerfil) {
        console.error('Error fetching cambios perfil:', errorPerfil);
        throw errorPerfil;
      }

      // Obtener cambios en asignaciones de roles del usuario
      const { data: cambiosRoles, error: errorRoles } = await supabase.rpc('get_change_history', {
        p_tabla_nombre: 'user_roles',
        p_registro_id: null,
        p_user_id: null,
        p_limit: 100,
        p_offset: 0
      });

      if (errorRoles) {
        console.error('Error fetching cambios roles:', errorRoles);
        throw errorRoles;
      }

      // Filtrar cambios de roles que afecten a este usuario
      const cambiosRolesFiltrados = (cambiosRoles || []).filter((cambio: CambioUsuario) => {
        return (
          (cambio.valores_anteriores?.user_id === usuarioId) ||
          (cambio.valores_nuevos?.user_id === usuarioId)
        );
      });

      // Combinar todos los cambios
      let todosCambios = [
        ...(cambiosPerfil || []),
        ...cambiosRolesFiltrados
      ];

      console.log('Fetched changes made TO user:', todosCambios);

      // Aplicar filtros
      if (filtroTipo && filtroTipo !== 'all') {
        todosCambios = todosCambios.filter(c => c.operation_type === filtroTipo);
      }
      if (busqueda) {
        todosCambios = todosCambios.filter(c => 
          c.descripcion_cambio.toLowerCase().includes(busqueda.toLowerCase())
        );
      }

      // Ordenar por fecha descendente
      todosCambios.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return todosCambios as CambioUsuario[];
    },
    enabled: !!usuarioId,
  });

  const limpiarFiltros = () => {
    setFiltroTipo('all');
    setBusqueda('');
  };

  const exportarDatos = () => {
    console.log('Exportar datos de auditoría del usuario');
  };

  const handleVerDetalles = (cambio: CambioUsuario) => {
    setSelectedCambio(cambio);
    setDetalleModalOpen(true);
  };

  const getDescripcionCambio = (cambio: CambioUsuario) => {
    if (cambio.tabla_nombre === 'profiles') {
      return `Cambio en perfil del usuario`;
    } else if (cambio.tabla_nombre === 'user_roles') {
      if (cambio.operation_type === 'INSERT') {
        return `Rol asignado al usuario`;
      } else if (cambio.operation_type === 'DELETE') {
        return `Rol removido del usuario`;
      } else {
        return `Cambio en rol del usuario`;
      }
    }
    return cambio.descripcion_cambio;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Auditoría del Usuario</h1>
        </div>
        <p className="text-muted-foreground">
          Monitoreo completo de actividades realizadas por {usuarioEmail} y cambios realizados en su cuenta
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="busqueda">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busqueda"
                  placeholder="Buscar en descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filtro_tipo">Tipo de Actividad</Label>
              <Select
                value={filtroTipo}
                onValueChange={setFiltroTipo}
              >
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

            <div className="flex items-end gap-2">
              <Button onClick={limpiarFiltros} className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Aplicar
              </Button>
              <Button variant="outline" onClick={limpiarFiltros}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs con contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="actividades" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Actividades Realizadas
            </TabsTrigger>
            <TabsTrigger value="cambios" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Cambios Recibidos
            </TabsTrigger>
          </TabsList>

          <Button 
            onClick={exportarDatos}
            disabled={activeTab === 'actividades' ? actividades.length === 0 : cambios.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Resultados
          </Button>
        </div>

        <TabsContent value="actividades">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actividades Realizadas por el Usuario
                </div>
                <div className="text-sm text-muted-foreground">
                  {isLoadingActividades ? 'Cargando...' : `${actividades.length} registros encontrados`}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                      <p className="text-sm">No hay actividades realizadas por este usuario con los filtros aplicados.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead className="w-[120px]">Tipo</TableHead>
                          <TableHead className="min-w-[300px]">Descripción</TableHead>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cambios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Cambios Realizados en el Usuario
                </div>
                <div className="text-sm text-muted-foreground">
                  {isLoadingCambios ? 'Cargando...' : `${cambios.length} registros encontrados`}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                      <p className="text-sm">No hay cambios registrados en este usuario con los filtros aplicados.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead className="w-[120px]">Operación</TableHead>
                          <TableHead className="min-w-[300px]">Descripción del Cambio</TableHead>
                          <TableHead className="w-[200px]">Campos Modificados</TableHead>
                          <TableHead className="w-[180px]">Realizado por</TableHead>
                          <TableHead className="w-[150px]">Fecha y Hora</TableHead>
                          <TableHead className="w-[100px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cambios.map((cambio) => (
                          <TableRow key={cambio.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={`text-xs font-medium ${getOperationColor(cambio.operation_type)}`}
                              >
                                {cambio.operation_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[300px]">
                                <p className="text-sm font-medium truncate" title={getDescripcionCambio(cambio)}>
                                  {getDescripcionCambio(cambio)}
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
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleVerDetalles(cambio)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver Detalles
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalles del cambio */}
      <CambioDetalleModal
        cambio={selectedCambio}
        open={detalleModalOpen}
        onOpenChange={setDetalleModalOpen}
      />
    </div>
  );
};
