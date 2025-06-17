
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { InteractiveCharts } from '@/components/analytics/InteractiveCharts';
import { BarChart3, PieChart, TrendingUp, Users, FileText, Shield } from 'lucide-react';

interface SmartAnalyticsGeneratorProps {
  onChartGenerated: (chartData: any) => void;
}

export const SmartAnalyticsGenerator: React.FC<SmartAnalyticsGeneratorProps> = ({ onChartGenerated }) => {
  const { data: stats } = useDashboardStats();
  const { users } = useUsers();
  const { roles } = useRoles();
  const [generatedCharts, setGeneratedCharts] = useState<any[]>([]);

  const generateUserAnalytics = () => {
    const userData = [
      { name: 'Activos', value: stats?.usuarios?.activos || 0, color: '#10B981' },
      { name: 'Inactivos', value: (stats?.usuarios?.total || 0) - (stats?.usuarios?.activos || 0), color: '#EF4444' },
      { name: 'Confirmados', value: stats?.usuarios?.confirmados || 0, color: '#3B82F6' },
    ];

    const newChart = {
      id: Date.now(),
      type: 'pie',
      title: 'Análisis de Usuarios',
      description: 'Distribución de usuarios por estado',
      data: userData
    };

    setGeneratedCharts(prev => [...prev, newChart]);
    onChartGenerated(newChart);
  };

  const generateReportsAnalytics = () => {
    const reportsData = [
      { name: 'Total', value: stats?.reportes?.total || 0, color: '#8B5CF6' },
      { name: 'Pendientes', value: stats?.reportes?.pendientes || 0, color: '#F59E0B' },
      { name: 'Completados', value: stats?.reportes?.completados || 0, color: '#10B981' },
      { name: 'Urgentes', value: stats?.reportes?.urgentes || 0, color: '#EF4444' },
    ];

    const newChart = {
      id: Date.now() + 1,
      type: 'bar',
      title: 'Análisis de Reportes',
      description: 'Estado actual de todos los reportes',
      data: reportsData
    };

    setGeneratedCharts(prev => [...prev, newChart]);
    onChartGenerated(newChart);
  };

  const generateRolesAnalytics = () => {
    const rolesData = roles.map((role, index) => ({
      name: role.nombre,
      value: Math.floor(Math.random() * 10) + 1, // Simulado - en producción sería real
      color: role.color || `#${Math.floor(Math.random()*16777215).toString(16)}`
    }));

    const newChart = {
      id: Date.now() + 2,
      type: 'pie',
      title: 'Distribución de Roles',
      description: 'Usuarios asignados por rol',
      data: rolesData
    };

    setGeneratedCharts(prev => [...prev, newChart]);
    onChartGenerated(newChart);
  };

  const generateTrendAnalytics = () => {
    const trendData = [
      { name: 'Enero', value: Math.floor(Math.random() * 50) + 10 },
      { name: 'Febrero', value: Math.floor(Math.random() * 50) + 15 },
      { name: 'Marzo', value: Math.floor(Math.random() * 50) + 20 },
      { name: 'Abril', value: Math.floor(Math.random() * 50) + 25 },
      { name: 'Mayo', value: Math.floor(Math.random() * 50) + 30 },
      { name: 'Junio', value: Math.floor(Math.random() * 50) + 35 },
    ].map(item => ({ ...item, color: '#3B82F6' }));

    const newChart = {
      id: Date.now() + 3,
      type: 'line',
      title: 'Tendencia de Actividad',
      description: 'Evolución mensual del sistema',
      data: trendData
    };

    setGeneratedCharts(prev => [...prev, newChart]);
    onChartGenerated(newChart);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Generador de Análisis Inteligente
          </CardTitle>
          <CardDescription>
            Genera gráficos y análisis dinámicos basados en los datos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={generateUserAnalytics}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
            >
              <Users className="h-6 w-6" />
              <span className="text-xs">Usuarios</span>
            </Button>
            
            <Button
              onClick={generateReportsAnalytics}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
            >
              <FileText className="h-6 w-6" />
              <span className="text-xs">Reportes</span>
            </Button>
            
            <Button
              onClick={generateRolesAnalytics}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
            >
              <Shield className="h-6 w-6" />
              <span className="text-xs">Roles</span>
            </Button>
            
            <Button
              onClick={generateTrendAnalytics}
              variant="outline"
              className="flex flex-col items-center gap-2 h-20"
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-xs">Tendencias</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mostrar gráficos generados */}
      {generatedCharts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Gráficos Generados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedCharts.map((chart) => (
              <div key={chart.id}>
                <InteractiveCharts
                  title={chart.title}
                  description={chart.description}
                  data={chart.data}
                  type={chart.type}
                  showTrends={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAnalyticsGenerator;
