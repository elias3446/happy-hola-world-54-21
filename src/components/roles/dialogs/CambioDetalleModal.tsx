
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database, 
  User, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  History, 
  Activity, 
  CheckCircle, 
  Info 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CambioRol {
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

interface CambioDetalleModalProps {
  cambio: CambioRol | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getOperationColor = (operation: CambioRol['operation_type']) => {
  switch (operation) {
    case 'INSERT': return 'bg-green-100 text-green-800 border-green-200';
    case 'UPDATE': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
    case 'SELECT': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const CambioDetalleModal: React.FC<CambioDetalleModalProps> = ({
  cambio,
  open,
  onOpenChange,
}) => {
  if (!cambio) return null;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const compareValues = (oldValue: any, newValue: any) => {
    const oldStr = formatValue(oldValue);
    const newStr = formatValue(newValue);
    return { oldStr, newStr, changed: oldStr !== newStr };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Detalles del Cambio - Rol
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-w-6xl">
          {/* Header con información general */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  Información del Cambio
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Tabla:</span>
                    <Badge variant="outline" className="font-mono">
                      {cambio.tabla_nombre}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Registro ID:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {cambio.registro_id}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Operación:</span>
                    <Badge className={`${getOperationColor(cambio.operation_type)} font-medium`}>
                      {cambio.operation_type}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Información del Usuario
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Usuario:</span>
                    <span className="text-sm font-medium text-blue-600">{cambio.user_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {format(new Date(cambio.created_at), 'dd/MM/yyyy', { locale: es })} a las{' '}
                      {format(new Date(cambio.created_at), 'HH:mm:ss', { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción del cambio */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600" />
              Descripción del Cambio
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{cambio.descripcion_cambio}</p>
          </div>

          {/* Campos modificados */}
          {cambio.campos_modificados && cambio.campos_modificados.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Campos Modificados ({cambio.campos_modificados.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {cambio.campos_modificados.map((campo, index) => (
                  <Badge key={index} variant="outline" className="bg-white border-yellow-300 text-yellow-800">
                    {campo}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Comparación de valores */}
          {(cambio.valores_anteriores || cambio.valores_nuevos) && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-purple-600" />
                Comparación de Valores
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Valores anteriores */}
                <div className="bg-red-50 border border-red-200 rounded-lg">
                  <div className="bg-red-100 px-4 py-3 border-b border-red-200 rounded-t-lg">
                    <h5 className="font-medium text-red-800 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Valores Anteriores
                    </h5>
                  </div>
                  <div className="p-4">
                    {cambio.valores_anteriores ? (
                      <ScrollArea className="h-64">
                        <pre className="text-xs font-mono text-red-700 whitespace-pre-wrap break-all">
                          {formatValue(cambio.valores_anteriores)}
                        </pre>
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-red-500">
                        <span className="text-sm italic">Sin valores anteriores</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Valores nuevos */}
                <div className="bg-green-50 border border-green-200 rounded-lg">
                  <div className="bg-green-100 px-4 py-3 border-b border-green-200 rounded-t-lg">
                    <h5 className="font-medium text-green-800 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Valores Nuevos
                    </h5>
                  </div>
                  <div className="p-4">
                    {cambio.valores_nuevos ? (
                      <ScrollArea className="h-64">
                        <pre className="text-xs font-mono text-green-700 whitespace-pre-wrap break-all">
                          {formatValue(cambio.valores_nuevos)}
                        </pre>
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-green-500">
                        <span className="text-sm italic">Sin valores nuevos</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Análisis detallado de cambios por campo */}
              {cambio.valores_anteriores && cambio.valores_nuevos && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Análisis Detallado de Cambios
                  </h5>
                  <div className="space-y-2">
                    {Object.keys({ ...cambio.valores_anteriores, ...cambio.valores_nuevos }).map((key) => {
                      const comparison = compareValues(
                        cambio.valores_anteriores?.[key],
                        cambio.valores_nuevos?.[key]
                      );
                      return (
                        <div key={key} className="bg-white p-3 rounded border">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">{key}:</span>
                            {comparison.changed && (
                              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                                Modificado
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div className="bg-red-50 p-2 rounded border border-red-200">
                              <span className="font-medium text-red-700">Anterior: </span>
                              <span className="font-mono text-red-600">{comparison.oldStr}</span>
                            </div>
                            <div className="bg-green-50 p-2 rounded border border-green-200">
                              <span className="font-medium text-green-700">Nuevo: </span>
                              <span className="font-mono text-green-600">{comparison.newStr}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
