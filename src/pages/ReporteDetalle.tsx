
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
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-8">
            <h1 className="text-xl font-bold mb-3 text-foreground">Reporte no encontrado</h1>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
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
          <div className="space-y-6 overflow-hidden">
            {/* Header Card with Report Info */}
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{ backgroundColor: reporte.categoria?.color || '#3B82F6' }}
                  >
                    {reporte.categoria?.icono?.charAt(0) || 'R'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-foreground mb-2 break-words">{reporte.nombre}</h1>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
                      >
                        {priorityConfig[reporte.priority]?.label || 'Urgente'}
                      </Badge>
                      
                      {reporte.categoria && (
                        <Badge variant="outline" className="border-border">
                          {reporte.categoria.nombre}
                        </Badge>
                      )}

                      {reporte.estado && (
                        <Badge 
                          variant="secondary"
                          className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
                        >
                          {reporte.estado.nombre}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-foreground mb-4 leading-relaxed break-words">
                  {reporte.descripcion}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="break-words">{formatDate(reporte.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span className="break-words">Reportado por {getReporterName(reporte.created_by_profile)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Card */}
            {reporte.imagenes && reporte.imagenes.length > 0 && (
              <Card className="bg-card border-border overflow-hidden">
                <CardHeader className="pb-3">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reporte.imagenes.map((imagen, index) => (
                      <div key={index} className="relative group overflow-hidden">
                        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted border-border border">
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
          <div className="space-y-6 overflow-hidden">
            {/* Map Card */}
            {reporte.latitud && reporte.longitud && (
              <Card className="bg-card border-border overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <MapPin className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <span>Ubicación del Incidente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 p-4">
                  <div className="rounded-lg overflow-hidden border-border border">
                    <MapaReporteEspecifico
                      reporte={reporte}
                      height="h-[400px]"
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
