
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Activity, 
  TrendingUp, 
  Filter, 
  BarChart3, 
  PieChart, 
  RefreshCw,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { RealTimeMetrics } from './RealTimeMetrics';
import { InteractiveCharts } from './InteractiveCharts';
import { AdvancedFiltersPanel } from './AdvancedFiltersPanel';
import { MultiReportComparison } from './MultiReportComparison';
import { NotificationSystem } from './NotificationSystem';

export const ReportesAnalytics = () => {
  const [activeView, setActiveView] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: stats, isLoading, error, refetch } = useDashboardStats();

  console.log('ReportesAnalytics - Dashboard stats:', stats);
  console.log('ReportesAnalytics - Loading:', isLoading);
  console.log('ReportesAnalytics - Error:', error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error al cargar estadísticas</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Usar SOLO datos reales de la base de datos
  const reportesData = stats?.reportes || {
    total: 0,
    activos: 0,
    porEstado: [],
    porCategoria: [],
    porPrioridad: [],
    recientes: 0,
    datosCompletos: []
  };

  console.log('ReportesAnalytics - Using reportes data:', reportesData);

  const handleRefresh = async () => {
    console.log('Refreshing dashboard stats...');
    await refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Análisis de Reportes - Datos en Tiempo Real
          </h2>
          <p className="text-muted-foreground">
            Vista avanzada con métricas interactivas y análisis detallado
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <AdvancedFiltersPanel 
          data={reportesData.datosCompletos}
          onFiltersChange={(filteredData) => {
            console.log('Filtered data:', filteredData);
          }}
        />
      )}

      {/* Métricas en tiempo real usando DATOS REALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RealTimeMetrics
          title="Total de Reportes"
          value={reportesData.total} // DATO REAL DE LA BASE DE DATOS
          subtitle={`${reportesData.activos} activos de ${reportesData.total} total`}
          icon={FileText}
          color="text-blue-600"
          refreshInterval={30000}
          onRefresh={handleRefresh}
        />
        
        <RealTimeMetrics
          title="Reportes Activos"
          value={reportesData.activos} // DATO REAL DE LA BASE DE DATOS
          previousValue={reportesData.total - reportesData.activos}
          subtitle={`${((reportesData.activos / Math.max(reportesData.total, 1)) * 100).toFixed(1)}% del total`}
          icon={Activity}
          color="text-green-600"
          refreshInterval={30000}
          onRefresh={handleRefresh}
        />
        
        <RealTimeMetrics
          title="Reportes Recientes"
          value={reportesData.recientes} // DATO REAL DE LA BASE DE DATOS
          subtitle="Últimos 7 días"
          icon={TrendingUp}
          color="text-purple-600"
          refreshInterval={30000}
          onRefresh={handleRefresh}
        />
        
        <RealTimeMetrics
          title="Distribución por Hora"
          value={reportesData.total} // DATO REAL DE LA BASE DE DATOS
          subtitle="Actividad por hora del día"
          icon={BarChart3}
          color="text-orange-600"
          showHourlyChart={true}
          hourlyData={reportesData.datosCompletos} // DATOS REALES DE LA BASE DE DATOS
          chartColor="#f97316"
        />
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="notifications">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Distribuciones usando DATOS REALES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Por Estado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportesData.porEstado.length > 0 ? (
                  reportesData.porEstado.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.estado}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay datos de estados</p>
                )}
              </CardContent>
            </Card>

            {/* Por Categoría */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Distribución por Categoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportesData.porCategoria.length > 0 ? (
                  reportesData.porCategoria.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.categoria}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay datos de categorías</p>
                )}
              </CardContent>
            </Card>

            {/* Por Prioridad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Distribución por Prioridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportesData.porPrioridad.length > 0 ? (
                  reportesData.porPrioridad.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          item.priority === 'alta' ? 'bg-red-500' :
                          item.priority === 'media' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span className="text-sm capitalize">{item.priority}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay datos de prioridades</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <InteractiveCharts data={reportesData} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <MultiReportComparison data={reportesData.datosCompletos} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSystem reportesData={reportesData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
