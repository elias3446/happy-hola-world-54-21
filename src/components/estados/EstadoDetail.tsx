
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useEstados } from '@/hooks/useEstados';
import type { Estado } from '@/types/estados';
import { 
  ArrowLeft, 
  Edit, 
  Circle, 
  Calendar,
  CheckCircle,
  XCircle,
  Palette,
  Lock
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface EstadoDetailProps {
  estado: Estado;
  onEdit: (estado: Estado) => void;
  onBack: () => void;
}

// Define system estados that cannot be modified
const SYSTEM_ESTADOS = ['Sin estado'];

const isSystemEstado = (estadoName: string): boolean => {
  return SYSTEM_ESTADOS.includes(estadoName);
};

export const EstadoDetail = ({ estado: initialEstado, onEdit, onBack }: EstadoDetailProps) => {
  const { toggleEstadoStatus, isToggling, estados } = useEstados();
  const [currentEstado, setCurrentEstado] = useState(initialEstado);

  const isSystemEstadoItem = isSystemEstado(currentEstado.nombre);

  // Update currentEstado when estados data changes
  useEffect(() => {
    const updatedEstado = estados.find(e => e.id === initialEstado.id);
    if (updatedEstado) {
      setCurrentEstado(updatedEstado);
    }
  }, [estados, initialEstado.id]);

  const handleToggleStatus = () => {
    if (isSystemEstadoItem) return;
    toggleEstadoStatus({ id: currentEstado.id, activo: !currentEstado.activo });
  };

  const handleEditClick = () => {
    if (isSystemEstadoItem) return;
    onEdit(currentEstado);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Estados
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium"
              style={{ backgroundColor: currentEstado.color }}
            >
              {currentEstado.icono.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{currentEstado.nombre}</h1>
                {isSystemEstadoItem && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Sistema
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">{currentEstado.descripcion}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleEditClick} 
            className="flex items-center gap-2"
            disabled={isSystemEstadoItem}
          >
            {isSystemEstadoItem ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
            {isSystemEstadoItem ? 'Protegido' : 'Editar Estado'}
          </Button>
        </div>
      </div>

      {/* System estado warning */}
      {isSystemEstadoItem && (
        <div className="mb-6">
          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Estado protegido del sistema</p>
              <p>Este estado es esencial para el funcionamiento del sistema y no puede ser modificado o eliminado.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre del Estado</label>
                <p className="text-lg font-semibold mt-1">{currentEstado.nombre}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <div className="flex items-center gap-3 mt-1">
                  <Switch
                    checked={currentEstado.activo}
                    onCheckedChange={handleToggleStatus}
                    disabled={isToggling || isSystemEstadoItem}
                  />
                  <Badge variant={currentEstado.activo ? "default" : "secondary"} className="flex items-center gap-1">
                    {currentEstado.activo ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {currentEstado.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <p className="text-gray-900 mt-1">{currentEstado.descripcion}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: currentEstado.color }}
                  />
                  <span className="text-gray-900 font-mono">{currentEstado.color}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Ícono</label>
                <p className="text-gray-900 mt-1">{currentEstado.icono}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha de Creación</label>
              <p className="text-gray-900 mt-1">
                {new Date(currentEstado.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Última Actualización</label>
              <p className="text-gray-900 mt-1">
                {new Date(currentEstado.updated_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">ID del Estado</label>
              <p className="text-gray-900 mt-1 font-mono text-xs break-all">{currentEstado.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Vista Previa Visual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <label className="text-sm font-medium text-gray-700 block mb-3">Vista de Lista</label>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: currentEstado.color }}
                  >
                    {currentEstado.icono.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{currentEstado.nombre}</p>
                    <p className="text-xs text-gray-600 truncate">{currentEstado.descripcion}</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <label className="text-sm font-medium text-gray-700 block mb-3">Vista de Tarjeta</label>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium mx-auto mb-2"
                    style={{ backgroundColor: currentEstado.color }}
                  >
                    {currentEstado.icono.charAt(0)}
                  </div>
                  <p className="font-medium text-sm">{currentEstado.nombre}</p>
                  <p className="text-xs text-gray-600 mt-1">{currentEstado.descripcion}</p>
                </div>
              </div>

              <div className="text-center">
                <label className="text-sm font-medium text-gray-700 block mb-3">Badge</label>
                <div className="p-4 border rounded-lg bg-gray-50 flex justify-center">
                  <Badge 
                    variant="secondary" 
                    className="flex items-center gap-2"
                    style={{ backgroundColor: currentEstado.color + '20', color: currentEstado.color }}
                  >
                    <span>{currentEstado.icono.charAt(0)}</span>
                    {currentEstado.nombre}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
