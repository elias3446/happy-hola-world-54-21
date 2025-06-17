import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { GoogleMapsButton } from '@/components/ui/google-maps-button';
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
  AlertTriangle,
  Eye,
  History,
  BarChart3,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReporteHistorial } from '@/hooks/useReporteHistorial';
import { useReportes } from '@/hooks/useReportes';
import { MapaReporteEspecifico } from '@/components/MapaBase';
import { ReporteAuditoria } from './ReporteAuditoria';
import type { Reporte } from '@/types/reportes';

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

  const handleToggleStatus = () => {
    toggleReporteStatus({ id: reporte.id, activo: !reporte.activo });
  };

  const openImageCarousel = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImageCarousel = () => {
    setSelectedImageIndex(null);
  };

  const getStatusBadge = () => {
    if (reporte.activo) {
      return {
        variant: "default" as const,
        icon: <CheckCircle className="h-3 w-3" />,
        text: "Activo"
      };
    } else {
      return {
        variant: "secondary" as const,
        icon: <XCircle className="h-3 w-3" />,
        text: "Inactivo"
      };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">Detalle del Reporte</h1>
            <p className="text-sm text-muted-foreground truncate">Información completa del reporte</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {reporte.latitud && reporte.longitud && (
            <GoogleMapsButton
              location={{
                latitud: reporte.latitud,
                longitud: reporte.longitud,
                direccion: reporte.direccion || undefined,
                referencia: reporte.referencia_direccion || undefined
              }}
              variant="outline"
              size="sm"
            />
          )}
          <Button 
            onClick={() => onEdit(reporte)} 
            className="flex items-center gap-2 text-sm"
            size="sm"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Editar Reporte</span>
            <span className="sm:hidden">Editar</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Información Principal - Responsive */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-16 w-16 sm:h-24 sm:w-24">
                  <AvatarFallback 
                    className="text-lg sm:text-xl text-white"
                    style={{ backgroundColor: reporte.categoria?.color || '#3B82F6' }}
                  >
                    {reporte.categoria?.icono?.charAt(0) || 'R'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-lg sm:text-xl break-words">{reporte.nombre}</CardTitle>
              <p className="text-sm text-muted-foreground break-words">{reporte.categoria?.nombre || 'Sin categoría'}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm break-words overflow-hidden">{reporte.descripcion}</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm break-words">
                    Creado: {format(new Date(reporte.created_at), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
                
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm break-words">
                    Actualizado: {format(new Date(reporte.updated_at), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm break-words">
                    Creado por: {getProfileName(reporte.created_by_profile)}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  Prioridad
                </h4>
                <div className="flex flex-wrap gap-2">
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

              <Separator />

              {/* Control de Estado del Reporte */}
              <div className="space-y-3">
                <h4 className="font-medium">Estado del Reporte</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={statusBadge.variant} 
                      className="flex items-center gap-1"
                    >
                      {statusBadge.icon}
                      {statusBadge.text}
                    </Badge>
                  </div>
                  
                  <Switch
                    checked={reporte.activo || false}
                    onCheckedChange={handleToggleStatus}
                    disabled={isToggling}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 flex-shrink-0" />
                  Asignación
                </h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Asignado a: </span>
                    <span className="break-words">{reporte.assigned_to_profile ? getProfileName(reporte.assigned_to_profile) : 'Sin asignar'}</span>
                  </div>
                </div>
              </div>

              {/* Información adicional del reporte */}
              <Separator />
              
              <div className="space-y-3">
                <div className="min-w-0">
                  <label className="text-sm font-medium text-gray-700">Categoría</label>
                  <div className="flex items-center gap-3 mt-1">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                      style={{ backgroundColor: reporte.categoria?.color || '#3B82F6' }}
                    >
                      {reporte.categoria?.icono?.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 break-words">{reporte.categoria?.nombre}</p>
                    </div>
                  </div>
                </div>
                
                <div className="min-w-0">
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <div className="flex items-center gap-3 mt-1">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                      style={{ backgroundColor: reporte.estado?.color || '#10B981' }}
                    >
                      {reporte.estado?.icono?.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 break-words">{reporte.estado?.nombre}</p>
                    </div>
                  </div>
                </div>
              </div>

              {reporte.latitud && reporte.longitud && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      Ubicación
                    </h4>
                    <div className="text-sm text-muted-foreground break-all">
                      Lat: {reporte.latitud}, Lng: {reporte.longitud}
                    </div>
                    <div className="mt-2">
                      <GoogleMapsButton
                        location={{
                          latitud: reporte.latitud,
                          longitud: reporte.longitud,
                          direccion: reporte.direccion || undefined,
                          referencia: reporte.referencia_direccion || undefined
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Información Detallada - Responsive */}
        <div className="xl:col-span-2">
          <Tabs defaultValue={reporte.imagenes && reporte.imagenes.length > 0 ? "evidencia" : reporte.latitud && reporte.longitud ? "ubicacion" : "historial"} className="space-y-4">
            {/* Responsive TabsList with scrollable layout */}
            <div className="overflow-x-auto">
              <TabsList className="flex w-full min-w-fit">
                {reporte.imagenes && reporte.imagenes.length > 0 && (
                  <TabsTrigger value="evidencia" className="flex items-center gap-1 px-2 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2 whitespace-nowrap">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden xs:inline sm:inline">Evidencia</span>
                  </TabsTrigger>
                )}
                {reporte.latitud && reporte.longitud && (
                  <TabsTrigger value="ubicacion" className="flex items-center gap-1 px-2 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2 whitespace-nowrap">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden xs:inline sm:inline">Ubicación</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="historial" className="flex items-center gap-1 px-2 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2 whitespace-nowrap">
                  <History className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden xs:inline sm:inline">Historial</span>
                </TabsTrigger>
                <TabsTrigger value="auditoria" className="flex items-center gap-1 px-2 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2 whitespace-nowrap">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden xs:inline sm:inline">Auditoría</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {reporte.imagenes && reporte.imagenes.length > 0 && (
              <TabsContent value="evidencia">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span>Evidencia Fotográfica</span>
                      </div>
                      <span className="text-sm font-normal text-muted-foreground flex-shrink-0">
                        {reporte.imagenes.length} imagen{reporte.imagenes.length !== 1 ? 'es' : ''}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {reporte.latitud && reporte.longitud && (
              <TabsContent value="ubicacion">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <span>Ubicación del Reporte</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg overflow-hidden border-border border">
                      <MapaReporteEspecifico
                        reporte={reporte}
                        height="h-[400px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="historial">
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
                          <div className="text-sm font-medium text-gray-900 break-words overflow-hidden">
                            {entry.comentario}
                          </div>
                          <div className="text-xs text-gray-600 mt-1 space-y-1">
                            <div className="break-words overflow-hidden">Por: {getProfileName(entry.assigned_by_profile)}</div>
                            {entry.assigned_from_profile && (
                              <div className="break-words overflow-hidden">De: {getProfileName(entry.assigned_from_profile)}</div>
                            )}
                            {entry.assigned_to_profile && (
                              <div className="break-words overflow-hidden">A: {getProfileName(entry.assigned_to_profile)}</div>
                            )}
                            <div className="text-gray-500 break-words">
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
            </TabsContent>

            <TabsContent value="auditoria">
              <ReporteAuditoria reporteId={reporte.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal del Carrusel de Imágenes */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => closeImageCarousel()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0" hideCloseButton>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span className="break-words overflow-hidden flex-1 min-w-0">Imágenes del Reporte - {reporte.nombre}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={closeImageCarousel}
                className="h-8 w-8 p-0 flex-shrink-0 ml-2"
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
