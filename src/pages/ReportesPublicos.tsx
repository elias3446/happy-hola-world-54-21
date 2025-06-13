
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useReportes } from '@/hooks/useReportes';
import { Search, Calendar, User, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const priorityConfig = {
  urgente: { color: '#DC2626', label: 'Urgente' },
  alto: { color: '#EA580C', label: 'Alto' },
  medio: { color: '#D97706', label: 'Medio' },
  bajo: { color: '#059669', label: 'Bajo' },
};

export const ReportesPublicos = () => {
  // Usar el hook con onlyPublic: true para filtrar solo reportes activos y no eliminados
  const { reportes, isLoading } = useReportes(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('all');

  // Filter reportes based on search term and category
  const filteredReportes = reportes.filter(reporte => {
    const matchesSearch = reporte.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reporte.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoria === 'all' || reporte.categoria_id === selectedCategoria;
    
    return matchesSearch && matchesCategory;
  });

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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Cargando reportes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Reportes Públicos</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Explora todos los reportes enviados por la comunidad
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredReportes.length} reporte{filteredReportes.length !== 1 ? 's' : ''} encontrado{filteredReportes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Reportes List */}
        {filteredReportes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 h-12 w-12 text-muted-foreground">
              <Search className="h-full w-full" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron reportes</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Intenta ajustar tu búsqueda o filtros" 
                : "Aún no hay reportes disponibles"
              }
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReportes.map((reporte) => (
              <Card key={reporte.id} className="overflow-hidden border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <CardTitle className="text-lg sm:text-xl break-words pr-2">
                      {reporte.nombre}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {reporte.estado && (
                        <Badge 
                          variant="secondary"
                          className="text-xs"
                          style={{ 
                            backgroundColor: `${getEstadoColor(reporte.estado)}20`,
                            color: getEstadoColor(reporte.estado),
                            borderColor: getEstadoColor(reporte.estado)
                          }}
                        >
                          {reporte.estado.nombre}
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                        style={{ 
                          backgroundColor: `${priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color}20`,
                          color: priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color,
                          borderColor: priorityConfig[reporte.priority]?.color || priorityConfig.urgente.color
                        }}
                      >
                        <AlertTriangle className="h-2 w-2" />
                        {priorityConfig[reporte.priority]?.label || 'Urgente'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Description */}
                  <div>
                    <p className="text-muted-foreground text-sm sm:text-base break-words">
                      {reporte.descripcion}
                    </p>
                  </div>

                  {/* Category */}
                  {reporte.categoria && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: reporte.categoria.color }}
                      />
                      <span className="text-sm font-medium break-words">
                        {reporte.categoria.nombre}
                      </span>
                    </div>
                  )}

                  {/* Location Information */}
                  {reporte.latitud && reporte.longitud && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="break-all">
                        {reporte.direccion || `${reporte.latitud.toFixed(6)}, ${reporte.longitud.toFixed(6)}`}
                      </span>
                    </div>
                  )}

                  {/* Meta Information */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="break-words">{formatDate(reporte.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 shrink-0" />
                      <span className="break-words">{getReporterName(reporte.created_by_profile)}</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/reporte/${reporte.id}`}>
                      Ver Detalles Completos
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesPublicos;
