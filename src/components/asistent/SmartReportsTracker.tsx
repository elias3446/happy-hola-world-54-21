
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReportes } from '@/hooks/useReportes';
import { useSecurity } from '@/hooks/useSecurity';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Timer,
  BarChart3,
  Target,
  Activity,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const SmartReportsTracker: React.FC = () => {
  const { hasPermission } = useSecurity();
  const { user } = useAuth();
  const { reportes = [], isLoading } = useReportes();
  const [filter, setFilter] = useState<'all' | 'pending' | 'urgent' | 'assigned' | 'mine'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');

  // Análisis inteligente de métricas
  const metrics = useMemo(() => {
    const total = reportes.length;
    const pending = reportes.filter(r => r.estado?.nombre?.toLowerCase() === 'pendiente').length;
    const urgent = reportes.filter(r => r.priority === 'urgente').length;
    const assigned = reportes.filter(r => r.assigned_to !== null).length;
    const mine = reportes.filter(r => r.assigned_to === user?.id).length;
    const completed = reportes.filter(r => r.estado?.nombre?.toLowerCase() === 'completado').length;
    
    // Cálculo de tendencias (últimos 7 días vs anteriores)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const lastWeek = reportes.filter(r => new Date(r.created_at) >= sevenDaysAgo).length;
    const previousWeek = reportes.filter(r => {
      const date = new Date(r.created_at);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    }).length;
    
    const trend = lastWeek - previousWeek;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      total,
      pending,
      urgent,
      assigned,
      mine,
      completed,
      trend,
      completionRate,
      unassignedRate: total > 0 ? ((total - assigned) / total) * 100 : 0
    };
  }, [reportes, user?.id]);

  // Filtros inteligentes
  const filteredReportes = useMemo(() => {
    let filtered = [...reportes];
    
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(r => r.estado?.nombre?.toLowerCase() === 'pendiente');
        break;
      case 'urgent':
        filtered = filtered.filter(r => r.priority === 'urgente');
        break;
      case 'assigned':
        filtered = filtered.filter(r => r.assigned_to !== null);
        break;
      case 'mine':
        filtered = filtered.filter(r => r.assigned_to === user?.id);
        break;
    }
    
    // Ordenamiento inteligente
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgente: 3, alto: 2, medio: 1, bajo: 0 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'status':
          return (a.estado?.nombre || '').localeCompare(b.estado?.nombre || '');
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    return filtered;
  }, [reportes, filter, sortBy, user?.id]);

  const getStatusColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'en proceso': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completado': return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgente': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'alto': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default: return <Timer className="h-4 w-4 text-blue-500" />;
    }
  };

  const getInsightLevel = (value: number, threshold: { good: number; warning: number }) => {
    if (value >= threshold.good) return 'success';
    if (value >= threshold.warning) return 'warning';
    return 'danger';
  };

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
    <div className="space-y-6">
      {/* Métricas Inteligentes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reportes</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              {metrics.trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ml-1 ${metrics.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(metrics.trend)} esta semana
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{metrics.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <Badge 
              variant="outline" 
              className={`mt-2 ${getInsightLevel(
                (metrics.pending / metrics.total) * 100, 
                { good: 20, warning: 50 }
              ) === 'success' ? 'text-green-600' : 
                getInsightLevel((metrics.pending / metrics.total) * 100, { good: 20, warning: 50 }) === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}
            >
              {metrics.total > 0 ? Math.round((metrics.pending / metrics.total) * 100) : 0}% del total
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold">{metrics.urgent}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <Badge 
              variant="outline" 
              className={`mt-2 ${metrics.urgent > 5 ? 'text-red-600' : metrics.urgent > 2 ? 'text-yellow-600' : 'text-green-600'}`}
            >
              {metrics.urgent > 5 ? 'Crítico' : metrics.urgent > 2 ? 'Moderado' : 'Bajo'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa Completado</p>
                <p className="text-2xl font-bold">{Math.round(metrics.completionRate)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <Badge 
              variant="outline" 
              className={`mt-2 ${metrics.completionRate >= 80 ? 'text-green-600' : metrics.completionRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
            >
              {metrics.completionRate >= 80 ? 'Excelente' : metrics.completionRate >= 60 ? 'Bueno' : 'Mejorable'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Filtrado */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seguimiento Inteligente de Reportes</CardTitle>
              <CardDescription>
                Análisis detallado y filtros inteligentes para optimizar el seguimiento
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos ({metrics.total})</SelectItem>
                  <SelectItem value="pending">Pendientes ({metrics.pending})</SelectItem>
                  <SelectItem value="urgent">Urgentes ({metrics.urgent})</SelectItem>
                  <SelectItem value="assigned">Asignados ({metrics.assigned})</SelectItem>
                  <SelectItem value="mine">Míos ({metrics.mine})</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="priority">Prioridad</SelectItem>
                  <SelectItem value="status">Estado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredReportes.map((reporte) => (
                <Card 
                  key={reporte.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
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

export default SmartReportsTracker;
