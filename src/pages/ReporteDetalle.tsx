
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReportes } from '@/hooks/useReportes';
import { MapaReporteEspecifico } from '@/components/MapaBase';
import { ArrowLeft, Calendar, User, AlertTriangle, MapPin, Eye } from 'lucide-react';

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

  const getReporterName = (profile: any) => {
    if (!profile) return 'Usuario desconocido';
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return fullName || profile.email || 'Usuario desconocido';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <Button asChild variant="outline" className="mb-4 shadow-sm">
            <Link to="/reportes-publicos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Reportes
            </Link>
          </Button>
          
          {/* Hero Section with Description */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg"
                    style={{ backgroundColor: reporte.categoria?.color || '#3B82F6' }}
                  >
                    {reporte.categoria?.icono?.charAt(0) || 'R'}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">{reporte.nombre}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-sm px-2 py-1 shadow-sm"
                        style={{ 
                          backgroundColor: `${priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color}15`,
                          color: priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color,
                          borderColor: `${priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color}30`
                        }}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {priorityConfig[reporte.priority]?.label || 'Urgente'}
                      </Badge>
                      
                      {reporte.categoria && (
                        <Badge variant="outline" className="flex items-center gap-1 shadow-sm">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: reporte.categoria.color }}
                          />
                          {reporte.categoria.nombre}
                        </Badge>
                      )}

                      {reporte.estado && (
                        <Badge 
                          variant="secondary"
                          className="text-sm px-2 py-1 shadow-sm"
                          style={{ 
                            backgroundColor: `${getEstadoColor(reporte.estado)}20`,
                            color: getEstadoColor(reporte.estado),
                            borderColor: `${getEstadoColor(reporte.estado)}30`
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: getEstadoColor(reporte.estado) }}
                          />
                          {reporte.estado.nombre}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Description moved here */}
                <div className="mb-4">
                  <p className="text-slate-700 leading-relaxed">
                    {reporte.descripcion}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{formatDate(reporte.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Reportado por {getReporterName(reporte.created_by_profile)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content - Images and Map side by side */}
          <div className="lg:col-span-3">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Images Gallery */}
              {reporte.imagenes && reporte.imagenes.length > 0 && (
                <Card className="shadow-lg border-slate-200 bg-white">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b border-slate-200 py-4">
                    <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Eye className="h-4 w-4 text-green-600" />
                      </div>
                      Evidencia Fotográfica
                      <Badge variant="secondary" className="ml-auto">
                        {reporte.imagenes.length} imagen{reporte.imagenes.length !== 1 ? 'es' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4 sm:grid-cols-1">
                      {reporte.imagenes.map((imagen, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 shadow-md border border-slate-200">
                            <img
                              src={imagen}
                              alt={`Imagen ${index + 1} del reporte`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Badge variant="secondary" className="shadow-lg">
                                Imagen {index + 1}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Map Section */}
              {reporte.latitud && reporte.longitud && (
                <Card className="shadow-lg border-slate-200 bg-white">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b border-slate-200 py-4">
                    <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-red-600" />
                      </div>
                      Ubicación del Incidente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="rounded-lg overflow-hidden shadow-md border border-slate-200">
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

          {/* Sidebar - Fechas Card */}
          <div className="space-y-6">
            <Card className="shadow-lg border-slate-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b border-slate-200 py-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Creado</label>
                    <p className="text-slate-800 font-medium mt-1 text-sm">
                      {formatDate(reporte.created_at)}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Última Actualización</label>
                    <p className="text-slate-800 font-medium mt-1 text-sm">
                      {formatDate(reporte.updated_at)}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">ID del Reporte</label>
                    <p className="text-slate-800 font-mono text-xs break-all mt-1">{reporte.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteDetalle;
