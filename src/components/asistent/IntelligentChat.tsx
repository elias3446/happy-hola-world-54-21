
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Database, BarChart3, Users, FileText, Shield, Circle, FolderOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import { useReportes } from '@/hooks/useReportes';
import { useCategories } from '@/hooks/useCategories';
import { useEstados } from '@/hooks/useEstados';
import { useRoles } from '@/hooks/useRoles';
import { useUsers } from '@/hooks/useUsers';
import AssistantIndex from './Index';

const IntelligentChat: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, userPermissions } = useSecurity();
  const { reportes = [] } = useReportes();
  const { categories = [] } = useCategories();
  const { estados = [] } = useEstados();
  const { roles = [] } = useRoles();
  const { users = [] } = useUsers();

  // Estadísticas rápidas para mostrar en el header del chat
  const quickStats = [
    {
      label: 'Reportes urgentes',
      value: reportes.filter(r => r.priority === 'urgente').length,
      icon: FileText,
      color: 'text-red-600'
    },
    {
      label: 'Usuarios activos',
      value: users.filter(u => u.asset).length,
      icon: Users,
      color: 'text-green-600'
    },
    {
      label: 'Categorías activas',
      value: categories.filter(c => c.activo).length,
      icon: FolderOpen,
      color: 'text-purple-600'
    },
    {
      label: 'Estados activos',
      value: estados.filter(e => e.activo).length,
      icon: Circle,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header del chat con contexto del sistema */}
      <div className="border-b bg-white/50 backdrop-blur-sm p-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Chat Inteligente Centralizado
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestiona reportes, usuarios, roles, categorías, estados y auditoría desde aquí
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Contexto Completo
            </Badge>
            {isAdmin() && (
              <Badge variant="secondary">Admin</Badge>
            )}
          </div>
        </div>
        
        {/* Estadísticas rápidas en línea */}
        <div className="flex flex-wrap gap-3 text-xs">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="flex items-center gap-1">
                <IconComponent className={`h-3 w-3 ${stat.color}`} />
                <span className="font-medium">{stat.value}</span>
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
            );
          })}
        </div>
        
        {/* Indicadores de capacidades */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className="text-xs">
            {userPermissions.length} permisos activos
          </Badge>
          <Badge variant="outline" className="text-xs">
            Gestión completa de datos
          </Badge>
          <Badge variant="outline" className="text-xs">
            Análisis inteligente
          </Badge>
          <Badge variant="outline" className="text-xs">
            RAG activado
          </Badge>
          <Badge variant="outline" className="text-xs">
            Memoria conversacional
          </Badge>
        </div>
      </div>

      {/* Chat component que maneja todas las funcionalidades */}
      <div className="flex-1 overflow-hidden">
        <AssistantIndex />
      </div>
    </div>
  );
};

export default IntelligentChat;
