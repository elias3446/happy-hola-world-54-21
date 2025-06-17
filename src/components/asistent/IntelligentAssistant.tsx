
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Shield,
  FolderOpen,
  Circle,
  Database
} from 'lucide-react';
import IntelligentChat from './IntelligentChat';

const IntelligentAssistant: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission, isAdmin, userPermissions } = useSecurity();
  const { reportes = [] } = useReportes();
  const { categories = [] } = useCategories();
  const { estados = [] } = useEstados();
  const { roles = [] } = useRoles();
  const { users = [] } = useUsers();
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
          priority: 'low',
          category: 'Categorías'
        });
      }
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

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Header compacto con altura fija */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 md:p-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 bg-white/20 rounded-lg flex-shrink-0">
                <Brain className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold truncate">Asistente Inteligente</h1>
                <p className="text-white/80 text-xs truncate">{getWelcomeMessage()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
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

          {/* Grid de métricas compacto */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2 overflow-hidden">
            {systemMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-white/20 min-w-0 flex-shrink-0">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-1">
                    <IconComponent className="h-3 w-3 md:h-4 md:w-4 text-white flex-shrink-0" />
                    <div className="min-w-0 flex-1 text-center md:text-left">
                      <p className="text-sm md:text-base font-bold text-white truncate">{metric.value}</p>
                      <p className="text-white/80 text-xs truncate">{metric.title}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insights rápidos si existen */}
          {insights.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {insights.slice(0, 3).map((insight, index) => {
                const IconComponent = insight.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 min-w-0 flex-shrink-0"
                  >
                    <div className={`p-1 rounded-full flex-shrink-0 ${
                      insight.type === 'urgent' ? 'bg-red-500/20' :
                      insight.type === 'warning' ? 'bg-yellow-500/20' :
                      insight.type === 'success' ? 'bg-green-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <IconComponent className="h-3 w-3 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate">{insight.title}</p>
                      <p className="text-white/70 text-xs truncate">{insight.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat centralizado que ocupa todo el espacio restante */}
      <div className="flex-1 overflow-hidden">
        <IntelligentChat />
      </div>
    </div>
  );
};

export default IntelligentAssistant;
