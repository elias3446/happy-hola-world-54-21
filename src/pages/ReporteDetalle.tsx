
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReportes } from '@/hooks/useReportes';
import { MapaReporteEspecifico } from '@/components/MapaBase';
import { ArrowLeft, Calendar, User, Eye, MapPin } from 'lucide-react';

const priorityConfig = {
  urgente: { color: '#DC2626', label: 'Urgente' },
  alto: { color: '#EA580C', label: 'Alto' },
  medio: { color: '#D97706', label: 'Medio' },
  bajo: { color: '#059669', label: 'Bajo' },
};

export const ReporteDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const { reportes, isLoading } = useReportes();
  
  const reporte = reportes.find(r => r.id === id);

  const getEstadoColor = (estado: any) => {
    if (!estado) return 'bg-gray-500';
    return estado.color || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReporterName = (profile: any) => {
    if (!profile) return 'Usuario desconocido';
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return fullName || profile.email || 'Usuario desconocido';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Cargando reporte...</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!reporte) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-8">
            <h1 className="text-xl font-bold mb-3">Reporte no encontrado</h1>
            <p className="text-muted-foreground mb-4">
              El reporte que buscas no existe o ha sido eliminado.
            </p>
            <Button asChild>
              <Link to="/reportes-publicos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Reportes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button asChild variant="outline" className="mb-4">
            <Link to="/reportes-publicos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Reportes
            </Link>
          </Button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Header Card with Report Info */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{ backgroundColor: reporte.categoria?.color || '#3B82F6' }}
                  >
                    {reporte.categoria?.icono?.charAt(0) || 'R'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">{reporte.nombre}</h1>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800 border-red-200"
                      >
                        {priorityConfig[reporte.priority]?.label || 'Urgente'}
                      </Badge>
                      
                      {reporte.categoria && (
                        <Badge variant="outline" className="border-gray-300">
                          {reporte.categoria.nombre}
                        </Badge>
                      )}

                      {reporte.estado && (
                        <Badge 
                          variant="secondary"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          {reporte.estado.nombre}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {reporte.descripcion}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(reporte.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Reportado por {getReporterName(reporte.created_by_profile)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Card */}
            {reporte.imagenes && reporte.imagenes.length > 0 && (
              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg font-semibold">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-green-600" />
                      <span>Evidencia Fotográfica</span>
                    </div>
                    <span className="text-sm font-normal text-gray-600">
                      {reporte.imagenes.length} imagen{reporte.imagenes.length !== 1 ? 'es' : ''}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {reporte.imagenes.map((imagen, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={imagen}
                            alt={`Evidencia ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Map Card */}
            {reporte.latitud && reporte.longitud && (
              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <span>Ubicación del Incidente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <MapaReporteEspecifico
                      reporte={reporte}
                      height="h-[300px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteDetalle;
