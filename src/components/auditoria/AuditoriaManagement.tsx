
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Activity, History, Filter, RefreshCw } from 'lucide-react';
import { useAuditoria } from '@/hooks/useAuditoria';
import { ActividadesList } from './ActividadesList';
import { CambiosHistorialList } from './CambiosHistorialList';
import { supabase } from '@/integrations/supabase/client';

export const AuditoriaManagement = () => {
  const {
    actividades,
    cambiosHistorial,
    isLoadingActividades,
    isLoadingCambios,
    filtros,
    setFiltros
  } = useAuditoria();

  const [filtrosTemp, setFiltrosTemp] = useState(filtros);
  const [registrosDisponibles, setRegistrosDisponibles] = useState<{id: string, display: string}[]>([]);
  const [isLoadingRegistros, setIsLoadingRegistros] = useState(false);

  // Obtener registros disponibles cuando cambia la tabla seleccionada
  useEffect(() => {
    const obtenerRegistros = async () => {
      if (!filtrosTemp.tabla_nombre) {
        // Si no hay tabla seleccionada, obtener IDs de todas las tablas
        try {
          setIsLoadingRegistros(true);
          const tablas = ['reportes', 'categories', 'estados', 'profiles', 'roles', 'user_roles'];
          const todosRegistros: {id: string, display: string}[] = [];

          for (const tabla of tablas) {
            const { data, error } = await supabase
              .from(tabla)
              .select('id, nombre, email, first_name, last_name')
              .limit(100);

            if (!error && data) {
              data.forEach((registro: any) => {
                const display = registro.nombre || 
                               registro.email || 
                               `${registro.first_name || ''} ${registro.last_name || ''}`.trim() ||
                               registro.id;
                todosRegistros.push({
                  id: registro.id,
                  display: `${tabla}: ${display}`
                });
              });
            }
          }
          setRegistrosDisponibles(todosRegistros);
        } catch (error) {
          console.error('Error obteniendo todos los registros:', error);
          setRegistrosDisponibles([]);
        } finally {
          setIsLoadingRegistros(false);
        }
      } else {
        // Obtener registros de la tabla específica
        try {
          setIsLoadingRegistros(true);
          let query = supabase.from(filtrosTemp.tabla_nombre).select('id');
          
          // Agregar campos adicionales según la tabla
          switch (filtrosTemp.tabla_nombre) {
            case 'reportes':
              query = supabase.from(filtrosTemp.tabla_nombre).select('id, nombre');
              break;
            case 'categories':
            case 'estados':
            case 'roles':
              query = supabase.from(filtrosTemp.tabla_nombre).select('id, nombre');
              break;
            case 'profiles':
              query = supabase.from(filtrosTemp.tabla_nombre).select('id, email, first_name, last_name');
              break;
            case 'user_roles':
              query = supabase.from(filtrosTemp.tabla_nombre).select('id');
              break;
          }

          const { data, error } = await query.limit(100);

          if (!error && data) {
            const registros = data.map((registro: any) => {
              const display = registro.nombre || 
                             registro.email || 
                             `${registro.first_name || ''} ${registro.last_name || ''}`.trim() ||
                             registro.id;
              return {
                id: registro.id,
                display: display
              };
            });
            setRegistrosDisponibles(registros);
          } else {
            setRegistrosDisponibles([]);
          }
        } catch (error) {
          console.error('Error obteniendo registros:', error);
          setRegistrosDisponibles([]);
        } finally {
          setIsLoadingRegistros(false);
        }
      }
    };

    obtenerRegistros();
  }, [filtrosTemp.tabla_nombre]);

  const aplicarFiltros = () => {
    setFiltros(filtrosTemp);
  };

  const limpiarFiltros = () => {
    const filtrosVacios = {
      user_id: null,
      tabla_nombre: null,
      registro_id: null,
      limit: 50,
      offset: 0
    };
    setFiltrosTemp(filtrosVacios);
    setFiltros(filtrosVacios);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Sistema de Auditoría</h1>
        </div>
        <p className="text-muted-foreground">
          Monitoreo completo de actividades y cambios en el sistema
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tabla_nombre">Tabla</Label>
              <Select
                value={filtrosTemp.tabla_nombre || "all"}
                onValueChange={(value) => {
                  setFiltrosTemp(prev => ({ 
                    ...prev, 
                    tabla_nombre: value === "all" ? null : value,
                    registro_id: null // Limpiar registro_id cuando cambia la tabla
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tabla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las tablas</SelectItem>
                  <SelectItem value="reportes">Reportes</SelectItem>
                  <SelectItem value="categories">Categorías</SelectItem>
                  <SelectItem value="estados">Estados</SelectItem>
                  <SelectItem value="profiles">Perfiles</SelectItem>
                  <SelectItem value="roles">Roles</SelectItem>
                  <SelectItem value="user_roles">Roles de Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="registro_id">ID de Registro</Label>
              <Select
                value={filtrosTemp.registro_id || "all"}
                onValueChange={(value) => 
                  setFiltrosTemp(prev => ({ 
                    ...prev, 
                    registro_id: value === "all" ? null : value 
                  }))
                }
                disabled={isLoadingRegistros}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingRegistros ? "Cargando..." : "Seleccionar registro"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los registros</SelectItem>
                  {registrosDisponibles.map((registro) => (
                    <SelectItem key={registro.id} value={registro.id}>
                      {registro.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="limit">Límite de Resultados</Label>
              <Select
                value={filtrosTemp.limit === 0 ? "all" : filtrosTemp.limit.toString()}
                onValueChange={(value) => 
                  setFiltrosTemp(prev => ({ 
                    ...prev, 
                    limit: value === "all" ? 0 : parseInt(value)
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 registros</SelectItem>
                  <SelectItem value="50">50 registros</SelectItem>
                  <SelectItem value="100">100 registros</SelectItem>
                  <SelectItem value="200">200 registros</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={aplicarFiltros} className="flex-1">
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
      <Tabs defaultValue="actividades" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="actividades" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividades
          </TabsTrigger>
          <TabsTrigger value="cambios" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial de Cambios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actividades">
          <ActividadesList 
            actividades={actividades} 
            isLoading={isLoadingActividades} 
          />
        </TabsContent>

        <TabsContent value="cambios">
          <CambiosHistorialList 
            cambios={cambiosHistorial} 
            isLoading={isLoadingCambios} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
