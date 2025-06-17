import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import { useReportes } from '@/hooks/useReportes';
import { useCategories } from '@/hooks/useCategories';
import { useEstados } from '@/hooks/useEstados';
import { useRoles } from '@/hooks/useRoles';
import { useUsers } from '@/hooks/useUsers';
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
  ArrowRight,
  Shield,
  FolderOpen,
  Circle,
  Database
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
  const { categories = [] } = useCategories();
  const { estados = [] } = useEstados();
  const { roles = [] } = useRoles();
  const { users = [] } = useUsers();
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState<any[]>([]);

  // Análisis inteligente del contexto del usuario
  useEffect(() => {
    if (user && userPermissions.length > 0) {
      generateIntelligentInsights();
    }
  }, [user, userPermissions, reportes, categories, estados, roles, users]);

  const generateIntelligentInsights = () => {
    const newInsights = [];
    
    // Análisis de reportes por prioridad
    if (hasPermission('ver_reporte')) {
      const urgentReports = reportes.filter(r => r.priority === 'urgente');
      const highPriorityReports = reportes.filter(r => r.priority === 'alto');
      const inactiveReports = reportes.filter(r => !r.activo);
      const myReports = reportes.filter(r => r.assigned_to === user?.id);
      
      if (urgentReports.length > 0) {
        newInsights.push({
          type: 'urgent',
          title: 'Reportes Urgentes',
          description: `${urgentReports.length} reportes con prioridad urgente requieren atención inmediata`,
          icon: AlertCircle,
          action: () => setActiveTab('reports'),
          priority: 'critical',
          category: 'Reportes'
        });
      }

      if (highPriorityReports.length > 0) {
        newInsights.push({
          type: 'warning',
          title: 'Reportes de Alta Prioridad',
          description: `${highPriorityReports.length} reportes de alta prioridad necesitan seguimiento`,
          icon: TrendingUp,
          action: () => setActiveTab('reports'),
          priority: 'high',
          category: 'Reportes'
        });
      }

      if (inactiveReports.length > 0) {
        newInsights.push({
          type: 'info',
          title: 'Reportes Inactivos',
          description: `${inactiveReports.length} reportes están marcados como inactivos`,
          icon: CheckCircle,
          action: () => setActiveTab('reports'),
          priority: 'medium',
          category: 'Reportes'
        });
      }

      if (myReports.length > 0) {
        newInsights.push({
          type: 'info',
          title: 'Mis Asignaciones',
          description: `Tienes ${myReports.length} reportes asignados`,
          icon: Target,
          action: () => setActiveTab('reports'),
          priority: 'medium',
          category: 'Reportes'
        });
      }
    }

    // Análisis de usuarios
    if (hasPermission('ver_usuario')) {
      const inactiveUsers = users.filter(u => !u.asset);
      const unconfirmedUsers = users.filter(u => !u.confirmed);

      if (inactiveUsers.length > 0) {
        newInsights.push({
          type: 'warning',
          title: 'Usuarios Inactivos',
          description: `${inactiveUsers.length} usuarios están marcados como inactivos`,
          icon: Users,
          action: () => window.open('/admin?tab=users', '_blank'),
          priority: 'medium',
          category: 'Usuarios'
        });
      }

      if (unconfirmedUsers.length > 0) {
        newInsights.push({
          type: 'info',
          title: 'Usuarios Sin Confirmar',
          description: `${unconfirmedUsers.length} usuarios no han confirmado su email`,
          icon: Users,
          action: () => window.open('/admin?tab=users', '_blank'),
          priority: 'low',
          category: 'Usuarios'
        });
      }
    }

    // Análisis de categorías
    if (hasPermission('ver_categoria')) {
      const inactiveCategories = categories.filter(c => !c.activo);
      const categoriesWithoutReports = categories.filter(c => 
        !reportes.some(r => r.categoria_id === c.id)
      );

      if (inactiveCategories.length > 0) {
        newInsights.push({
          type: 'info',
          title: 'Categorías Inactivas',
          description: `${inactiveCategories.length} categorías están desactivadas`,
          icon: FolderOpen,
          action: () => window.open('/admin?tab=categories', '_blank'),
          priority: 'low',
          category: 'Categorías'
        });
      }

      if (categoriesWithoutReports.length > 0) {
        newInsights.push({
          type: 'info',
          title: 'Categorías Sin Uso',
          description: `${categoriesWithoutReports.length} categorías no tienen reportes asignados`,
          icon: FolderOpen,
          action: () => window.open('/admin?tab=categories', '_blank'),
          priority: 'low',
          category: 'Categorías'
        });
      }
    }

    // Análisis de estados
    if (hasPermission('ver_estado')) {
      const inactiveEstados = estados.filter(e => !e.activo);
      const estadosWithoutReports = estados.filter(e => 
        !reportes.some(r => r.estado_id === e.id)
      );

      if (inactiveEstados.length > 0) {
        newInsights.push({
          type: 'info',
          title: 'Estados Inactivos',
          description: `${inactiveEstados.length} estados están desactivados`,
          icon: Circle,
          action: () => window.open('/admin?tab=estados', '_blank'),
          priority: 'low',
          category: 'Estados'
        });
      }

      if (estadosWithoutReports.length > 0) {
        newInsights.push({
          type: 'info',
          title: 'Estados Sin Uso',
          description: `${estadosWithoutReports.length} estados no tienen reportes asignados`,
          icon: Circle,
          action: () => window.open('/admin?tab=estados', '_blank'),
          priority: 'low',
          category: 'Estados'
        });
      }
    }

    // Análisis de roles
    if (hasPermission('ver_rol')) {
      const inactiveRoles = roles.filter(r => !r.activo);

      if (inactiveRoles.length > 0) {
        newInsights.push({
          type: 'info',
          title: 'Roles Inactivos',
          description: `${inactiveRoles.length} roles están desactivados`,
          icon: Shield,
          action: () => window.open('/admin?tab=roles', '_blank'),
          priority: 'low',
          category: 'Roles'
        });
      }
    }

    // Análisis de actividad del día
    const today = new Date();
    const todayReports = reportes.filter(r => {
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
        priority: 'low',
        category: 'Sistema'
      });
    }

    setInsights(newInsights.sort((a, b) => {
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

  // Métricas principales agrupadas por área
  const systemMetrics = [
    {
      title: 'Reportes',
      value: reportes.length,
      subtitle: `${reportes.filter(r => r.priority === 'urgente').length} urgentes`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      category: 'reportes'
    },
    {
      title: 'Usuarios',
      value: users.filter(u => u.asset).length,
      subtitle: `${users.length} total`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      category: 'usuarios'
    },
    {
      title: 'Categorías',
      value: categories.filter(c => c.activo).length,
      subtitle: `${categories.length} total`,
      icon: FolderOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      category: 'categorias'
    },
    {
      title: 'Estados',
      value: estados.filter(e => e.activo).length,
      subtitle: `${estados.length} total`,
      icon: Circle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      category: 'estados'
    },
    {
      title: 'Roles',
      value: roles.filter(r => r.activo).length,
      subtitle: `${roles.length} total`,
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      category: 'roles'
    },
    {
      title: 'Permisos',
      value: userPermissions.length,
      subtitle: isAdmin() ? 'Admin' : 'Usuario',
      icon: Database,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      category: 'permisos'
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
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Header con altura fija */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 md:p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
                <Brain className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold truncate">Asistente Inteligente</h1>
                <p className="text-white/80 text-xs md:text-sm truncate">{getWelcomeMessage()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAdmin() && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                  Admin
                </Badge>
              )}
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-xs">
                {userPermissions.length} permisos
              </Badge>
            </div>
          </div>

          {/* Grid de métricas con overflow hidden */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 overflow-hidden">
            {systemMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/20 min-w-0 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-white flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-base md:text-lg font-bold text-white truncate">{metric.value}</p>
                      <p className="text-white/80 text-xs truncate">{metric.title}</p>
                      <p className="text-white/60 text-xs truncate">{metric.subtitle}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navegación de tabs con altura fija */}
      <div className="border-b bg-white/50 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-transparent p-0 h-auto">
              {availableTabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs sm:text-sm min-w-0"
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium truncate">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="h-full overflow-hidden">
            {/* Tab Overview con scroll */}
            <TabsContent value="overview" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-3 md:p-4 space-y-4 md:space-y-6">
                  <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                    {/* Insights importantes */}
                    {insights.length > 0 && (
                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                            <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                            Insights del Sistema
                          </CardTitle>
                          <CardDescription className="text-sm">
                            Análisis inteligente de todas las áreas del sistema
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {insights.slice(0, 5).map((insight, index) => {
                              const IconComponent = insight.icon;
                              return (
                                <div 
                                  key={index}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
                                  onClick={insight.action}
                                >
                                  <div className={`p-2 rounded-full flex-shrink-0 ${
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
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                      <p className="font-medium text-gray-900 text-sm truncate">{insight.title}</p>
                                      <Badge variant="outline" className="text-xs w-fit">
                                        {insight.category}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{insight.description}</p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
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
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                          <Zap className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                          Acciones Rápidas
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Acciones más utilizadas organizadas por categoría
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                          {hasPermission('crear_reporte') && (
                            <Button 
                              variant="outline" 
                              className="h-14 md:h-16 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 text-xs md:text-sm"
                              onClick={() => window.open('/nuevo-reporte', '_blank')}
                            >
                              <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                              <span className="font-medium">Crear Reporte</span>
                            </Button>
                          )}
                          
                          {hasPermission('ver_reporte') && (
                            <Button 
                              variant="outline" 
                              className="h-14 md:h-16 flex flex-col gap-2 hover:bg-green-50 hover:border-green-200 text-xs md:text-sm"
                              onClick={() => setActiveTab('analytics')}
                            >
                              <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                              <span className="font-medium">Ver Analytics</span>
                            </Button>
                          )}
                          
                          {isAdmin() && (
                            <>
                              <Button 
                                variant="outline" 
                                className="h-14 md:h-16 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-200 text-xs md:text-sm"
                                onClick={() => window.open('/admin?tab=users', '_blank')}
                              >
                                <Users className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                                <span className="font-medium">Gestionar Usuarios</span>
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                className="h-14 md:h-16 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-200 text-xs md:text-sm"
                                onClick={() => window.open('/admin?tab=categories', '_blank')}
                              >
                                <FolderOpen className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                                <span className="font-medium">Gestionar Categorías</span>
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                className="h-14 md:h-16 flex flex-col gap-2 hover:bg-red-50 hover:border-red-200 text-xs md:text-sm"
                                onClick={() => window.open('/admin?tab=roles', '_blank')}
                              >
                                <Shield className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                                <span className="font-medium">Gestionar Roles</span>
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                className="h-14 md:h-16 flex flex-col gap-2 hover:bg-indigo-50 hover:border-indigo-200 text-xs md:text-sm"
                                onClick={() => window.open('/admin?tab=estados', '_blank')}
                              >
                                <Circle className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                                <span className="font-medium">Gestionar Estados</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Resumen por áreas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base md:text-lg flex items-center gap-2">
                            <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                            Reportes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Total</span>
                              <span className="text-sm font-medium">{reportes.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Urgentes</span>
                              <span className="text-sm font-medium text-red-600">
                                {reportes.filter(r => r.priority === 'urgente').length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Alta prioridad</span>
                              <span className="text-sm font-medium text-orange-600">
                                {reportes.filter(r => r.priority === 'alto').length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Activos</span>
                              <span className="text-sm font-medium text-green-600">
                                {reportes.filter(r => r.activo).length}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base md:text-lg flex items-center gap-2">
                            <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                            Usuarios y Sistema
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Usuarios totales</span>
                              <span className="text-sm font-medium">{users.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Usuarios activos</span>
                              <span className="text-sm font-medium">{users.filter(u => u.asset).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Roles activos</span>
                              <span className="text-sm font-medium">{roles.filter(r => r.activo).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Mis permisos</span>
                              <span className="text-sm font-medium">{userPermissions.length}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="lg:col-span-2 xl:col-span-1">
                        <CardHeader>
                          <CardTitle className="text-base md:text-lg flex items-center gap-2">
                            <Database className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                            Configuración
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Categorías activas</span>
                              <span className="text-sm font-medium">{categories.filter(c => c.activo).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Estados activos</span>
                              <span className="text-sm font-medium">{estados.filter(e => e.activo).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Total categorías</span>
                              <span className="text-sm font-medium">{categories.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Total estados</span>
                              <span className="text-sm font-medium">{estados.length}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-3 md:p-4">
                  <div className="max-w-7xl mx-auto">
                    <AssistantDashboard onActionSuggestion={handleActionSuggestion} />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="reports" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-3 md:p-4">
                  <div className="max-w-7xl mx-auto">
                    <SmartReportsTracker />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="actions" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-3 md:p-4">
                  <div className="max-w-7xl mx-auto">
                    <ContextualActions onActionExecute={(action, params) => {
                      console.log('Ejecutando acción:', action, params);
                    }} />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chat" className="h-full m-0">
              <IntelligentChat />
            </TabsContent>

            <TabsContent value="notifications" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-3 md:p-4">
                  <div className="max-w-7xl mx-auto">
                    <SmartNotifications />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default IntelligentAssistant;
