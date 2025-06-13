
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReportes } from '@/hooks/useReportes';
import { MapaReporteEspecifico } from '@/components/MapaBase';
import { ArrowLeft, Calendar, User, FileText, AlertTriangle, MapPin, Eye, Clock } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with improved styling */}
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-6 shadow-sm">
            <Link to="/reportes-publicos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Reportes
            </Link>
          </Button>
          
          {/* Hero Section */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                    style={{ backgroundColor: reporte.categoria?.color || '#3B82F6' }}
                  >
                    {reporte.categoria?.icono?.charAt(0) || 'R'}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">{reporte.nombre}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-2 text-sm px-3 py-1 shadow-sm"
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
                        <Badge variant="outline" className="flex items-center gap-2 shadow-sm">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: reporte.categoria.color }}
                          />
                          {reporte.categoria.nombre}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{formatDate(reporte.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Reportado por Ciudadano</span>
                  </div>
                  {reporte.latitud && reporte.longitud && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>Ubicación registrada</span>
                    </div>
                  )}
                </div>
              </div>
              
              {reporte.estado && (
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    variant="secondary"
                    className="text-sm px-4 py-2 shadow-sm"
                    style={{ 
                      backgroundColor: `${getEstadoColor(reporte.estado)}20`,
                      color: getEstadoColor(reporte.estado),
                      borderColor: `${getEstadoColor(reporte.estado)}30`
                    }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getEstadoColor(reporte.estado) }}
                    />
                    {reporte.estado.nombre}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <Card className="shadow-lg border-slate-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b border-slate-200">
                <CardTitle className="flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  Descripción del Reporte
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-slate-700 leading-relaxed text-lg">
                  {reporte.descripcion}
                </p>
              </CardContent>
            </Card>

            {/* Images Gallery */}
            {reporte.imagenes && reporte.imagenes.length > 0 && (
              <Card className="shadow-lg border-slate-200 bg-white">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b border-slate-200">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    Evidencia Fotográfica
                    <Badge variant="secondary" className="ml-auto">
                      {reporte.imagenes.length} imagen{reporte.imagenes.length !== 1 ? 'es' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid gap-6 sm:grid-cols-2">
                    {reporte.imagenes.map((imagen, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 shadow-md border border-slate-200">
                          <img
                            src={imagen}
                            alt={`Imagen ${index + 1} del reporte`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-xl flex items-center justify-center">
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
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b border-slate-200">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-red-600" />
                    </div>
                    Ubicación del Incidente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="rounded-xl overflow-hidden shadow-md border border-slate-200">
                    <MapaReporteEspecifico
                      reporte={reporte}
                      height="h-[400px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar with enhanced info cards */}
          <div className="space-y-8">
            {/* Quick Info Card */}
            <Card className="shadow-lg border-slate-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b border-slate-200">
                <CardTitle className="flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Fecha de Creación</label>
                    <p className="text-slate-800 font-medium mt-1">
                      {formatDate(reporte.created_at)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Última Actualización</label>
                    <p className="text-slate-800 font-medium mt-1">
                      {formatDate(reporte.updated_at)}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">ID del Reporte</label>
                    <p className="text-slate-800 font-mono text-xs break-all mt-1">{reporte.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Summary Card */}
            <Card className="shadow-lg border-slate-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b border-slate-200">
                <CardTitle className="text-slate-800">Resumen del Estado</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-600">Prioridad</span>
                    <Badge
                      variant="secondary"
                      className="shadow-sm"
                      style={{ 
                        backgroundColor: `${priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color}15`,
                        color: priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color,
                        borderColor: `${priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color}30`
                      }}
                    >
                      {priorityConfig[reporte.priority]?.label || 'Urgente'}
                    </Badge>
                  </div>
                  
                  {reporte.categoria && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-sm font-medium text-slate-600">Categoría</span>
                      <Badge variant="outline" className="shadow-sm">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: reporte.categoria.color }}
                        />
                        {reporte.categoria.nombre}
                      </Badge>
                    </div>
                  )}
                  
                  {reporte.estado && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-sm font-medium text-slate-600">Estado</span>
                      <Badge 
                        variant="secondary"
                        className="shadow-sm"
                        style={{ 
                          backgroundColor: `${getEstadoColor(reporte.estado)}20`,
                          color: getEstadoColor(reporte.estado),
                          borderColor: `${getEstadoColor(reporte.estado)}30`
                        }}
                      >
                        {reporte.estado.nombre}
                      </Badge>
                    </div>
                  )}
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
