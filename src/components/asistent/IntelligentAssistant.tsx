
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
  Lightbulb
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
  const [recommendations, setRecommendations] = useState<any[]>([]);

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

    setRecommendations(newRecommendations);
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

  const availableTabs = [
    { id: 'overview', label: 'Resumen', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'ver_reporte' },
    { id: 'reports', label: 'Reportes', icon: FileText, permission: 'ver_reporte' },
    { id: 'actions', label: 'Acciones', icon: Zap },
    { id: 'chat', label: 'Chat IA', icon: Brain },
    { id: 'notifications', label: 'Alertas', icon: Bell }
  ].filter(tab => !tab.permission || hasPermission(tab.permission as any));

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto bg-background">
      {/* Header del Asistente */}
      <div className="bg-primary text-primary-foreground p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Asistente Inteligente
            </h1>
            <p className="text-primary-foreground/80 mt-1">
              {getWelcomeMessage()}
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin() && <Badge variant="secondary">Admin</Badge>}
            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
              {userPermissions.length} permisos
            </Badge>
          </div>
        </div>

        {/* Insights Rápidos */}
        {insights.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {insights.slice(0, 3).map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <Card 
                  key={index} 
                  className="min-w-[280px] bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={insight.action}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <IconComponent className="h-4 w-4 text-white mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm">{insight.title}</p>
                        <p className="text-white/80 text-xs leading-relaxed">{insight.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabs de Contenido */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid grid-cols-6 w-full">
              {availableTabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden p-6">
            <TabsContent value="overview" className="h-full overflow-auto space-y-6">
              {/* Resumen Inteligente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Insights Inteligentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {insights.map((insight, index) => {
                      const IconComponent = insight.icon;
                      return (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={insight.action}
                        >
                          <IconComponent className={`h-4 w-4 mt-0.5 ${
                            insight.type === 'urgent' ? 'text-red-500' :
                            insight.type === 'warning' ? 'text-yellow-500' :
                            insight.type === 'success' ? 'text-green-500' :
                            'text-blue-500'
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{insight.title}</p>
                            <p className="text-muted-foreground text-xs">{insight.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Recomendaciones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Recomendaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recommendations.map((rec, index) => {
                      const IconComponent = rec.icon;
                      return (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={rec.action}
                        >
                          <IconComponent className="h-4 w-4 mt-0.5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{rec.title}</p>
                            <p className="text-muted-foreground text-xs">{rec.description}</p>
                            <Badge variant="outline" className="mt-1 text-xs">{rec.category}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="h-full overflow-auto">
              <AssistantDashboard />
            </TabsContent>

            <TabsContent value="reports" className="h-full overflow-auto">
              <SmartReportsTracker />
            </TabsContent>

            <TabsContent value="actions" className="h-full overflow-auto">
              <ContextualActions onActionExecute={(action, params) => {
                console.log('Ejecutando acción:', action, params);
              }} />
            </TabsContent>

            <TabsContent value="chat" className="h-full overflow-hidden">
              <IntelligentChat />
            </TabsContent>

            <TabsContent value="notifications" className="h-full overflow-auto">
              <SmartNotifications />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default IntelligentAssistant;
