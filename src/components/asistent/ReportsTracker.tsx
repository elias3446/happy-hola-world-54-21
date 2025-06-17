
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReportes } from '@/hooks/useReportes';
import { useSecurity } from '@/hooks/useSecurity';
import { 
  Clock, 
  User, 
  MapPin, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportsTrackerProps {
  onReportClick: (reportId: string) => void;
}

const ReportsTracker: React.FC<ReportsTrackerProps> = ({ onReportClick }) => {
  const { hasPermission } = useSecurity();
  const { reportes = [], isLoading } = useReportes();
  const [filter, setFilter] = useState<'all' | 'pending' | 'urgent' | 'assigned'>('all');

  if (!hasPermission('ver_reporte')) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No tienes permisos para ver reportes
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'en proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'alto':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default:
        return <Timer className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredReportes = reportes.filter(reporte => {
    switch (filter) {
      case 'pending':
        return reporte.estado?.nombre?.toLowerCase() === 'pendiente';
      case 'urgent':
        return reporte.priority === 'urgente';
      case 'assigned':
        return reporte.assigned_to !== null;
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Seguimiento de Reportes</CardTitle>
          <CardDescription>
            Monitorea el estado y progreso de todos los reportes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todos ({reportes.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pendientes ({reportes.filter(r => r.estado?.nombre?.toLowerCase() === 'pendiente').length})
            </Button>
            <Button
              variant={filter === 'urgent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('urgent')}
            >
              Urgentes ({reportes.filter(r => r.priority === 'urgente').length})
            </Button>
            <Button
              variant={filter === 'assigned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('assigned')}
            >
              Asignados ({reportes.filter(r => r.assigned_to !== null).length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes ({filteredReportes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {filteredReportes.map((reporte) => (
                <Card 
                  key={reporte.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onReportClick(reporte.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(reporte.priority || 'medio')}
                          <h4 className="font-semibold text-sm">{reporte.nombre}</h4>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {reporte.descripcion}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(reporte.created_at), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </div>
                          
                          {reporte.assigned_to_profile && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>
                                {reporte.assigned_to_profile.first_name} {reporte.assigned_to_profile.last_name}
                              </span>
                            </div>
                          )}
                          
                          {reporte.direccion && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">
                                {reporte.direccion}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={getStatusColor(reporte.estado?.nombre || '')}>
                          {reporte.estado?.nombre || 'Sin estado'}
                        </Badge>
                        
                        {reporte.categoria && (
                          <Badge variant="outline" style={{ color: reporte.categoria.color }}>
                            {reporte.categoria.nombre}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredReportes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay reportes que coincidan con el filtro seleccionado
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTracker;
