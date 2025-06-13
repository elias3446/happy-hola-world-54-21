
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReportes } from '@/hooks/useReportes';
import { MapaReporteEspecifico } from '@/components/MapaBase';
import { ArrowLeft, Calendar, User, FileText, AlertTriangle } from 'lucide-react';

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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Cargando reporte...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reporte) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Reporte no encontrado</h1>
          <p className="text-muted-foreground mb-6">
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="outline" className="mb-4">
          <Link to="/reportes-publicos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Reportes
          </Link>
        </Button>
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{reporte.nombre}</h1>
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(reporte.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Ciudadano</span>
              </div>
            </div>
          </div>
          
          {reporte.estado && (
            <Badge 
              variant="secondary"
              className="text-sm px-3 py-1"
              style={{ 
                backgroundColor: `${getEstadoColor(reporte.estado)}20`,
                color: getEstadoColor(reporte.estado),
                borderColor: getEstadoColor(reporte.estado)
              }}
            >
              {reporte.estado.nombre}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {reporte.descripcion}
              </p>
            </CardContent>
          </Card>

          {/* Images */}
          {reporte.imagenes && reporte.imagenes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Imágenes del Reporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {reporte.imagenes.map((imagen, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imagen}
                        alt={`Imagen ${index + 1} del reporte`}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mapa del Reporte */}
          {reporte.latitud && reporte.longitud && (
            <Card>
              <CardHeader>
                <CardTitle>Ubicación del Reporte</CardTitle>
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Prioridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant="secondary"
                className="flex items-center gap-2 w-fit text-sm px-3 py-2"
                style={{ 
                  backgroundColor: `${priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color}20`,
                  color: priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color,
                  borderColor: priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color
                }}
              >
                <AlertTriangle className="h-4 w-4" />
                {priorityConfig[reporte.priority]?.label || 'Urgente'}
              </Badge>
            </CardContent>
          </Card>

          {/* Category */}
          {reporte.categoria && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: reporte.categoria.color }}
                  />
                  <div>
                    <p className="font-medium">{reporte.categoria.nombre}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporteDetalle;
