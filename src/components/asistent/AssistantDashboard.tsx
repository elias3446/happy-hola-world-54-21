
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSecurity } from '@/hooks/useSecurity';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Users,
  FileText,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

interface AssistantDashboardProps {
  onActionSuggestion: (suggestion: string) => void;
}

const AssistantDashboard: React.FC<AssistantDashboardProps> = ({ onActionSuggestion }) => {
  const { hasPermission, isAdmin } = useSecurity();
  const { data: stats } = useDashboardStats();

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Datos de ejemplo para gráficos (en una implementación real, estos vendrían de la API)
  const reportesData = [
    { name: 'Enero', reportes: 65 },
    { name: 'Febrero', reportes: 59 },
    { name: 'Marzo', reportes: 80 },
    { name: 'Abril', reportes: 81 },
    { name: 'Mayo', reportes: 56 },
    { name: 'Junio', reportes: 55 },
  ];

  const estadosData = [
    { name: 'Pendiente', value: 35, color: '#FF8042' },
    { name: 'En Proceso', value: 25, color: '#FFBB28' },
    { name: 'Completado', value: 40, color: '#00C49F' },
  ];

  // Generar sugerencias contextuales
  const generateSuggestions = () => {
    const suggestions = [];
    
    if (hasPermission('ver_reporte')) {
      suggestions.push("Revisar reportes pendientes de esta semana");
      suggestions.push("Analizar tendencias de reportes por categoría");
    }
    
    if (hasPermission('crear_reporte')) {
      suggestions.push("Crear un nuevo reporte urgente");
    }
    
    if (hasPermission('ver_usuario') && isAdmin()) {
      suggestions.push("Revisar usuarios sin actividad reciente");
      suggestions.push("Generar reporte de actividad del sistema");
    }
    
    return suggestions;
  };

  const suggestions = generateSuggestions();

  return (
    <div className="space-y-6">
      {/* Métricas Clave */}
      {hasPermission('ver_reporte') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reportes Activos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.reportes?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                +12% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.reportes?.porEstado?.find(e => e.estado.toLowerCase().includes('pendiente'))?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.reportes?.porEstado?.find(e => e.estado.toLowerCase().includes('completado'))?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.reportes?.porPrioridad?.find(p => p.priority === 'urgente')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Prioridad alta
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos Interactivos */}
      {hasPermission('ver_reporte') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Tendencia de Reportes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tendencia de Reportes
              </CardTitle>
              <CardDescription>Reportes creados por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={reportesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reportes" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pastel - Estados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Distribución por Estados
              </CardTitle>
              <CardDescription>Estado actual de los reportes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={estadosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {estadosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sugerencias Contextuales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Acciones Sugeridas
          </CardTitle>
          <CardDescription>
            Recomendaciones basadas en tus permisos y actividad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{suggestion}</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onActionSuggestion(suggestion)}
                >
                  Ejecutar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información de Usuario */}
      {hasPermission('ver_usuario') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Resumen de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats?.usuarios?.total || 0}</div>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats?.usuarios?.activos || 0}</div>
                <p className="text-sm text-muted-foreground">Activos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats?.usuarios?.recientes || 0}</div>
                <p className="text-sm text-muted-foreground">Nuevos (30 días)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas y Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Urgente</Badge>
              <span className="text-sm">3 reportes requieren atención inmediata</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Info</Badge>
              <span className="text-sm">Sistema funcionando correctamente</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantDashboard;
