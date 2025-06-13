import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useReporteHistorial } from '@/hooks/useReporteHistorial';
import { useReportes } from '@/hooks/useReportes';
import { MapaReporteEspecifico } from '@/components/MapaBase';
import type { Reporte } from '@/types/reportes';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  MapPin,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Image,
  Clock,
  FileText,
  X,
  AlertTriangle
} from 'lucide-react';

interface ReporteDetailProps {
  reporte: Reporte;
  onEdit: (reporte: Reporte) => void;
  onBack: () => void;
}

const priorityConfig = {
  urgente: { color: '#DC2626', label: 'Urgente' },
  alto: { color: '#EA580C', label: 'Alto' },
  medio: { color: '#D97706', label: 'Medio' },
  bajo: { color: '#059669', label: 'Bajo' },
};

export const ReporteDetail = ({ reporte, onEdit, onBack }: ReporteDetailProps) => {
  const { historial, isLoading: isLoadingHistorial } = useReporteHistorial(reporte.id);
  const { toggleReporteStatus, isToggling } = useReportes();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const getProfileName = (profile: any) => {
    if (!profile) return 'N/A';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email;
  };

  const hasLocation = reporte.latitud && reporte.longitud;

  const handleToggleStatus = () => {
    toggleReporteStatus({ id: reporte.id, activo: !reporte.activo });
  };

  const openImageCarousel = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImageCarousel = () => {
    setSelectedImageIndex(null);
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
          Volver a Reportes
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-medium"
              style={{ backgroundColor: reporte.categoria?.color || '#3B82F6' }}
            >
              {reporte.categoria?.icono?.charAt(0) || 'R'}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{reporte.nombre}</h1>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1"
                  style={{ 
                    backgroundColor: `${priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color}20`,
                    color: priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color,
                    borderColor: priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color
                  }}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {priorityConfig[reporte.priority]?.label || 'Urgente'}
                </Badge>
              </div>
            </div>
          </div>
          
          <Button onClick={() => onEdit(reporte)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Reporte
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal y Mapa */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Reporte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información del Reporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <p className="text-gray-900 mt-1">{reporte.descripcion}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Categoría</label>
                  <div className="flex items-center gap-3 mt-1">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: reporte.categoria?.color || '#3B82F6' }}
                    >
                      {reporte.categoria?.icono?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{reporte.categoria?.nombre}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <div className="flex items-center gap-3 mt-1">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: reporte.estado?.color || '#10B981' }}
                    >
                      {reporte.estado?.icono?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{reporte.estado?.nombre}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Prioridad</label>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 w-fit"
                      style={{ 
                        backgroundColor: `${priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color}20`,
                        color: priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color,
                        borderColor: priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color
                      }}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {priorityConfig[reporte.priority]?.label || 'Urgente'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Estado del Reporte</label>
                  <div className="flex items-center gap-3 mt-1">
                    <Switch
                      checked={reporte.activo || false}
                      onCheckedChange={handleToggleStatus}
                      disabled={isToggling}
                    />
                    <Badge variant={reporte.activo ? "default" : "secondary"} className="flex items-center gap-1">
                      {reporte.activo ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {reporte.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Creado por</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{getProfileName(reporte.created_by_profile)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Asignado a</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">
                      {reporte.assigned_to_profile ? getProfileName(reporte.assigned_to_profile) : 'Sin asignar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Imágenes */}
              {reporte.imagenes && reporte.imagenes.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
                      <Image className="h-4 w-4" />
                      Imágenes del Reporte ({reporte.imagenes.length})
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reporte.imagenes.map((imagen, index) => (
                        <div key={index} className="relative group cursor-pointer">
                          <div 
                            className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                            onClick={() => openImageCarousel(index)}
                          >
                            <img
                              src={imagen}
                              alt={`Imagen ${index + 1} del reporte ${reporte.nombre}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                openImageCarousel(index);
                              }}
                              className="h-8 px-2"
                            >
                              Ver
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Mapa de Ubicación */}
          {hasLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación del Reporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapaReporteEspecifico
                  reporte={reporte}
                  height="h-[400px]"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Información Adicional y Historial */}
        <div className="space-y-6">
          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información de Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha de Creación</label>
                <p className="text-gray-900 mt-1 text-sm">
                  {new Date(reporte.created_at).toLocaleDateString('es-ES', {
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
                <p className="text-gray-900 mt-1 text-sm">
                  {new Date(reporte.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">ID del Reporte</label>
                <p className="text-gray-900 mt-1 font-mono text-xs break-all">{reporte.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Asignaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historial de Asignaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistorial ? (
                <p className="text-gray-500 text-sm">Cargando historial...</p>
              ) : historial.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Sin historial de asignaciones</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {historial.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.comentario}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 space-y-1">
                        <div>Por: {getProfileName(entry.assigned_by_profile)}</div>
                        {entry.assigned_from_profile && (
                          <div>De: {getProfileName(entry.assigned_from_profile)}</div>
                        )}
                        {entry.assigned_to_profile && (
                          <div>A: {getProfileName(entry.assigned_to_profile)}</div>
                        )}
                        <div className="text-gray-500">
                          {new Date(entry.fecha_asignacion).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal del Carrusel de Imágenes */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => closeImageCarousel()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Imágenes del Reporte - {reporte.nombre}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={closeImageCarousel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedImageIndex !== null && reporte.imagenes && (
            <div className="p-6 pt-0">
              <Carousel className="w-full max-w-3xl mx-auto">
                <CarouselContent>
                  {reporte.imagenes.map((imagen, index) => (
                    <CarouselItem key={index}>
                      <div className="flex justify-center">
                        <div className="max-h-[60vh] w-full flex items-center justify-center">
                          <img
                            src={imagen}
                            alt={`Imagen ${index + 1} del reporte ${reporte.nombre}`}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                          Imagen {index + 1} de {reporte.imagenes.length}
                        </p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
