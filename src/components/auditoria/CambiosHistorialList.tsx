
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { History, Clock, User, Eye, Database } from 'lucide-react';
import { CambioHistorial } from '@/hooks/useAuditoria';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CambiosHistorialListProps {
  cambios: CambioHistorial[];
  isLoading: boolean;
}

const getOperationColor = (operation: CambioHistorial['operation_type']) => {
  switch (operation) {
    case 'INSERT': return 'bg-green-100 text-green-800 border-green-200';
    case 'UPDATE': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
    case 'SELECT': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const DetallesCambio: React.FC<{ cambio: CambioHistorial }> = ({ cambio }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Información General</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Tabla:</span> {cambio.tabla_nombre}
            </div>
            <div>
              <span className="font-medium">Registro ID:</span> {cambio.registro_id}
            </div>
            <div>
              <span className="font-medium">Operación:</span>
              <Badge className={`ml-2 ${getOperationColor(cambio.operation_type)}`}>
                {cambio.operation_type}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Usuario:</span> {cambio.user_email}
            </div>
            <div>
              <span className="font-medium">Fecha:</span> 
              {format(new Date(cambio.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Campos Modificados</h4>
          <div className="space-y-1">
            {cambio.campos_modificados?.map((campo, index) => (
              <Badge key={index} variant="outline" className="mr-1">
                {campo}
              </Badge>
            ))}
            {(!cambio.campos_modificados || cambio.campos_modificados.length === 0) && (
              <span className="text-sm text-muted-foreground">Sin campos modificados</span>
            )}
          </div>
        </div>
      </div>

      {cambio.valores_anteriores && (
        <div>
          <h4 className="font-semibold mb-2">Valores Anteriores</h4>
          <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-40">
            {JSON.stringify(cambio.valores_anteriores, null, 2)}
          </pre>
        </div>
      )}

      {cambio.valores_nuevos && (
        <div>
          <h4 className="font-semibold mb-2">Valores Nuevos</h4>
          <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-40">
            {JSON.stringify(cambio.valores_nuevos, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export const CambiosHistorialList: React.FC<CambiosHistorialListProps> = ({ 
  cambios, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial de Cambios ({cambios.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operación</TableHead>
                <TableHead>Tabla</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cambios.map((cambio) => (
                <TableRow key={cambio.id}>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getOperationColor(cambio.operation_type)}
                    >
                      {cambio.operation_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <Database className="h-3 w-3 mr-1" />
                      {cambio.tabla_nombre}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={cambio.descripcion_cambio}>
                      {cambio.descripcion_cambio}
                    </div>
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
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Detalles
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalles del Cambio</DialogTitle>
                        </DialogHeader>
                        <DetallesCambio cambio={cambio} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {cambios.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron cambios registrados
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
