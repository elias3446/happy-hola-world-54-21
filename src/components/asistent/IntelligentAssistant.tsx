import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import { useReportes } from '@/hooks/useReportes';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Bell, 
  Zap, 
  BarChart3,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Target,
  Activity,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import AssistantDashboard from './AssistantDashboard';
import SmartReportsTracker from './SmartReportsTracker';
import ContextualActions from './ContextualActions';
import IntelligentChat from './IntelligentChat';
import SmartNotifications from './SmartNotifications';

const IntelligentAssistant: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission, isAdmin, userPermissions } = useSecurity();
  const { reportes = [] } = useReportes();
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState<any[]>([]);

  // Análisis inteligente del contexto del usuario
  useEffect(() => {
    if (user && userPermissions.length > 0) {
      generateIntelligentInsights();
      generateContextualRecommendations();
    }
  }, [user, userPermissions, reportes]);

  const generateIntelligentInsights = () => {
    const newInsights = [];
    
    // Análisis de reportes
    if (hasPermission('ver_reporte')) {
      const pendingReports = reportes.filter(r => r.estado?.nombre?.toLowerCase() === 'pendiente');
      const urgentReports = reportes.filter(r => r.priority === 'urgente');
      const myReports = reportes.filter(r => r.assigned_to === user?.id);
      
      if (pendingReports.length > 0) {
        newInsights.push({
          type: 'warning',
          title: 'Reportes Pendientes',
          description: `Tienes ${pendingReports.length} reportes pendientes que requieren atención`,
          icon: AlertCircle,
          action: () => setActiveTab('reports'),
          priority: 'high'
        });
      }

      if (urgentReports.length > 0) {
        newInsights.push({
          type: 'urgent',
          title: 'Reportes Urgentes',
          description: `${urgentReports.length} reportes marcados como urgentes necesitan atención inmediata`,
          icon: AlertCircle,
          action: () => setActiveTab('reports'),
          priority: 'critical'
        });
      }

      if (myReports.length > 0) {
        newInsights.push({
          type: 'info',
          title: 'Mis Asignaciones',
          description: `Tienes ${myReports.length} reportes asignados a tu nombre`,
          icon: Target,
          action: () => setActiveTab('reports'),
          priority: 'medium'
        });
      }
    }

    // Análisis de productividad
    const todayReports = reportes.filter(r => {
      const today = new Date();
      const reportDate = new Date(r.created_at);
      return reportDate.toDateString() === today.toDateString();
    });

    if (todayReports.length > 0) {
      newInsights.push({
        type: 'success',
        title: 'Actividad del Día',
        description: `Se han creado ${todayReports.length} reportes hoy`,
        icon: Activity,
        action: () => setActiveTab('analytics'),
        priority: 'low'
      });
    }

    setInsights(newInsights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }));
  };

  const generateContextualRecommendations = () => {
    const newRecommendations = [];

    // Recomendaciones basadas en rol
    if (isAdmin()) {
      newRecommendations.push({
        title: 'Revisar Dashboard Analytics',
        description: 'Revisa las métricas del sistema para identificar tendencias',
        action: () => setActiveTab('analytics'),
        icon: BarChart3,
        category: 'Administración'
      });

      newRecommendations.push({
        title: 'Gestionar Usuarios',
        description: 'Verifica los permisos y roles de usuarios activos',
        action: () => window.open('/admin/usuarios', '_blank'),
        icon: Users,
        category: 'Administración'
      });
    }

    // Recomendaciones para todos los usuarios
    if (hasPermission('crear_reporte')) {
      newRecommendations.push({
        title: 'Crear Nuevo Reporte',
        description: 'Documenta incidencias o solicitudes rápidamente',
        action: () => window.open('/nuevo-reporte', '_blank'),
        icon: FileText,
        category: 'Reportes'
      });
    }

    if (reportes.length > 5) {
      newRecommendations.push({
        title: 'Optimizar Flujo de Trabajo',
        description: 'Considera usar filtros y vistas personalizadas para mayor eficiencia',
        action: () => setActiveTab('actions'),
        icon: Zap,
        category: 'Productividad'
      });
    }

    setInsights(insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }));
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) greeting = "Buenos días";
    else if (hour < 18) greeting = "Buenas tardes";
    else greeting = "Buenas noches";

    const userName = user?.email?.split('@')[0] || 'Usuario';
    return `${greeting}, ${userName}`;
  };

  const handleActionSuggestion = (suggestion: string) => {
    console.log('Ejecutando sugerencia:', suggestion);
  };

  // Métricas principales para el overview
  const mainMetrics = [
    {
      title: 'Reportes Totales',
      value: reportes.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pendientes',
      value: reportes.filter(r => r.estado?.nombre?.toLowerCase() === 'pendiente').length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Urgentes',
      value: reportes.filter(r => r.priority === 'urgente').length,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Completados',
      value: reportes.filter(r => r.estado?.nombre?.toLowerCase() === 'completado').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  const availableTabs = [
    { id: 'overview', label: 'Resumen', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'ver_reporte' },
    { id: 'reports', label: 'Reportes', icon: FileText, permission: 'ver_reporte' },
    { id: 'actions', label: 'Acciones', icon: Zap },
    { id: 'chat', label: 'Chat IA', icon: Brain },
    { id: 'notifications', label: 'Alertas', icon: Bell }
  ].filter(tab => !tab.permission || hasPermission(tab.permission as any));

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto bg-background">
      {/* Header simplificado y limpio */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Asistente Inteligente</h1>
              <p className="text-white/80">{getWelcomeMessage()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin() && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Admin
              </Badge>
            )}
            <Badge variant="outline" className="bg-white/10 text-white border-white/30">
              {userPermissions.length} permisos
            </Badge>
          </div>
        </div>

        {/* Métricas rápidas en el header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mainMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-white" />
                  <div>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="text-white/80 text-sm">{metric.title}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navegación de tabs mejorada */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-transparent p-0 h-auto">
              {availableTabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="h-full p-6">
            {/* Tab Overview rediseñado */}
            <TabsContent value="overview" className="h-full overflow-auto space-y-6 mt-0">
              {/* Insights importantes */}
              {insights.length > 0 && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-5 w-5 text-blue-500" />
                      Insights Importantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.slice(0, 3).map((insight, index) => {
                        const IconComponent = insight.icon;
                        return (
                          <div 
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
                            onClick={insight.action}
                          >
                            <div className={`p-2 rounded-full ${
                              insight.type === 'urgent' ? 'bg-red-100' :
                              insight.type === 'warning' ? 'bg-yellow-100' :
                              insight.type === 'success' ? 'bg-green-100' :
                              'bg-blue-100'
                            }`}>
                              <IconComponent className={`h-4 w-4 ${
                                insight.type === 'urgent' ? 'text-red-600' :
                                insight.type === 'warning' ? 'text-yellow-600' :
                                insight.type === 'success' ? 'text-green-600' :
                                'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{insight.title}</p>
                              <p className="text-sm text-gray-600">{insight.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Acciones rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Acciones Rápidas
                  </CardTitle>
                  <CardDescription>
                    Acciones más utilizadas según tu rol y permisos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hasPermission('crear_reporte') && (
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
                        onClick={() => window.open('/nuevo-reporte', '_blank')}
                      >
                        <FileText className="h-6 w-6 text-blue-600" />
                        <span className="font-medium">Crear Reporte</span>
                      </Button>
                    )}
                    
                    {hasPermission('ver_reporte') && (
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-200"
                        onClick={() => setActiveTab('analytics')}
                      >
                        <BarChart3 className="h-6 w-6 text-green-600" />
                        <span className="font-medium">Ver Analytics</span>
                      </Button>
                    )}
                    
                    {isAdmin() && (
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-200"
                        onClick={() => window.open('/admin/usuarios', '_blank')}
                      >
                        <Users className="h-6 w-6 text-purple-600" />
                        <span className="font-medium">Gestionar Usuarios</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resumen de actividad */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportes.slice(0, 3).map((reporte, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{reporte.nombre}</p>
                            <p className="text-xs text-gray-600">{reporte.categoria?.nombre}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {reporte.estado?.nombre}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estado del Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Reportes Pendientes</span>
                        <Badge variant={mainMetrics[1].value > 10 ? "destructive" : "secondary"}>
                          {mainMetrics[1].value}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Reportes Urgentes</span>
                        <Badge variant={mainMetrics[2].value > 5 ? "destructive" : "secondary"}>
                          {mainMetrics[2].value}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tasa de Completado</span>
                        <Badge variant="outline" className="text-green-600">
                          {mainMetrics[0].value > 0 ? Math.round((mainMetrics[3].value / mainMetrics[0].value) * 100) : 0}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="h-full overflow-auto mt-0">
              <AssistantDashboard onActionSuggestion={handleActionSuggestion} />
            </TabsContent>

            <TabsContent value="reports" className="h-full overflow-auto mt-0">
              <SmartReportsTracker />
            </TabsContent>

            <TabsContent value="actions" className="h-full overflow-auto mt-0">
              <ContextualActions onActionExecute={(action, params) => {
                console.log('Ejecutando acción:', action, params);
              }} />
            </TabsContent>

            <TabsContent value="chat" className="h-full overflow-hidden mt-0">
              <IntelligentChat />
            </TabsContent>

            <TabsContent value="notifications" className="h-full overflow-auto mt-0">
              <SmartNotifications />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default IntelligentAssistant;
