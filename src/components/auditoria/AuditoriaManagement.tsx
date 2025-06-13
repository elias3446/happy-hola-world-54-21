
import React, { useState } from 'react';
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
                onValueChange={(value) => 
                  setFiltrosTemp(prev => ({ 
                    ...prev, 
                    tabla_nombre: value === "all" ? null : value 
                  }))
                }
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
              <Input
                id="registro_id"
                placeholder="ID del registro"
                value={filtrosTemp.registro_id || ""}
                onChange={(e) => 
                  setFiltrosTemp(prev => ({ 
                    ...prev, 
                    registro_id: e.target.value || null 
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="limit">Límite de Resultados</Label>
              <Select
                value={filtrosTemp.limit.toString()}
                onValueChange={(value) => 
                  setFiltrosTemp(prev => ({ 
                    ...prev, 
                    limit: parseInt(value) 
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
