
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReportes } from '@/hooks/useReportes';
import MapaReportesMultiples from '@/components/MapaBase/MapaReportesMultiples';
import { MapPin, Calendar, User, AlertTriangle, X } from 'lucide-react';

const priorityConfig = {
  urgente: { color: '#DC2626', label: 'Urgente' },
  alto: { color: '#EA580C', label: 'Alto' },
  medio: { color: '#D97706', label: 'Medio' },
  bajo: { color: '#059669', label: 'Bajo' },
};

export const MapaReportes = () => {
  const { reportes, isLoading } = useReportes();
  const [selectedReporte, setSelectedReporte] = useState<any>(null);

  // Transform reportes to match MapaReportesMultiples expected format
  const transformedReportes = reportes
    .filter(reporte => reporte.latitud && reporte.longitud)
    .map(reporte => ({
      id: reporte.id,
      titulo: reporte.nombre,
      descripcion: reporte.descripcion,
      ubicacion: {
        latitud: reporte.latitud,
        longitud: reporte.longitud
      },
      // Incluir todos los datos del reporte original para el panel de detalles
      originalData: reporte
    }));

  const handleReporteClick = (reporte: any) => {
    setSelectedReporte(reporte.originalData || reporte);
  };

  const handleClosePanel = () => {
    setSelectedReporte(null);
  };

  const getEstadoColor = (estado: any) => {
    if (!estado) return 'bg-gray-500';
    return estado.color || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground text-sm sm:text-base">Cargando mapa de reportes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 break-words">Mapa de Reportes</h1>
              <p className="text-muted-foreground text-sm sm:text-base break-words">
                Visualiza todos los reportes en el mapa interactivo
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <span className="break-words">{transformedReportes.length} reportes en el mapa</span>
            <span className="hidden sm:inline">•</span>
            <span className="break-words">Haz clic en un marcador para ver detalles</span>
          </div>
        </div>

        {/* Map Container with Details Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Map */}
          <div className={selectedReporte ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {transformedReportes.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 px-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No hay reportes disponibles</h3>
                    <p className="text-muted-foreground text-sm sm:text-base mb-4 break-words">
                      Aún no se han enviado reportes para mostrar en el mapa
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <MapaReportesMultiples
                      reportes={transformedReportes}
                      height="h-[400px] sm:h-[500px] lg:h-[600px]"
                      onReporteClick={handleReporteClick}
                      className="rounded-lg"
                      selectedReporteId={selectedReporte?.id}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Details Panel */}
          {selectedReporte && (
            <div className="lg:col-span-1">
              <Card className="h-fit overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg break-words min-w-0 flex-1">Detalles del Reporte</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClosePanel}
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Título y Prioridad */}
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2 break-words">{selectedReporte.nombre}</h3>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 w-fit text-xs"
                      style={{ 
                        backgroundColor: `${priorityConfig[selectedReporte.priority]?.color || priorityConfig.urgente.color}20`,
                        color: priorityConfig[selectedReporte.priority]?.color || priorityConfig.urgente.color,
                        borderColor: priorityConfig[selectedReporte.priority]?.color || priorityConfig.urgente.color
                      }}
                    >
                      <AlertTriangle className="h-2 w-2 sm:h-3 sm:w-3" />
                      {priorityConfig[selectedReporte.priority]?.label || 'Urgente'}
                    </Badge>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Descripción</label>
                    <p className="text-xs sm:text-sm mt-1 break-words">{selectedReporte.descripcion}</p>
                  </div>

                  {/* Categoría */}
                  {selectedReporte.categoria && (
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">Categoría</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: selectedReporte.categoria.color }}
                        />
                        <span className="text-xs sm:text-sm break-words">{selectedReporte.categoria.nombre}</span>
                      </div>
                    </div>
                  )}

                  {/* Estado */}
                  {selectedReporte.estado && (
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">Estado</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: selectedReporte.estado.color }}
                        />
                        <span className="text-xs sm:text-sm break-words">{selectedReporte.estado.nombre}</span>
                      </div>
                    </div>
                  )}

                  {/* Ubicación */}
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-2 w-2 sm:h-3 sm:w-3" />
                      Ubicación
                    </label>
                    <p className="text-xs sm:text-sm mt-1 break-all">
                      {selectedReporte.direccion || `${selectedReporte.latitud?.toFixed(6)}, ${selectedReporte.longitud?.toFixed(6)}`}
                    </p>
                  </div>

                  {/* Fecha de creación */}
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-2 w-2 sm:h-3 sm:w-3" />
                      Fecha de creación
                    </label>
                    <p className="text-xs sm:text-sm mt-1 break-words">{formatDate(selectedReporte.created_at)}</p>
                  </div>

                  {/* Creado por */}
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <User className="h-2 w-2 sm:h-3 sm:w-3" />
                      Creado por
                    </label>
                    <p className="text-xs sm:text-sm mt-1 break-words">
                      {selectedReporte.created_by_profile 
                        ? `${selectedReporte.created_by_profile.first_name || ''} ${selectedReporte.created_by_profile.last_name || ''}`.trim() || selectedReporte.created_by_profile.email
                        : 'Usuario desconocido'
                      }
                    </p>
                  </div>

                  {/* Imágenes */}
                  {selectedReporte.imagenes && selectedReporte.imagenes.length > 0 && (
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Imágenes ({selectedReporte.imagenes.length})
                      </label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {selectedReporte.imagenes.slice(0, 4).map((imagen: string, index: number) => (
                          <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-100">
                            <img
                              src={imagen}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      {selectedReporte.imagenes.length > 4 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          +{selectedReporte.imagenes.length - 4} imágenes más
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapaReportes;
