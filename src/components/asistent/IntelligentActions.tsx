
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIntelligentAssistant } from '@/hooks/useIntelligentAssistant';
import { 
  Brain, 
  Zap, 
  Search, 
  Plus, 
  BarChart3, 
  Map,
  CheckCircle,
  XCircle,
  Clock,
  Send
} from 'lucide-react';

export const IntelligentActions: React.FC = () => {
  const {
    processIntelligentQuery,
    executeDirectAction,
    responses,
    isLoading,
    userPermissions,
    hasPermission
  } = useIntelligentAssistant();
  
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      await processIntelligentQuery(query);
      setQuery('');
    }
  };

  const quickActions = [
    {
      id: 'stats',
      title: 'Estadísticas del Sistema',
      description: 'Ver resumen completo',
      icon: BarChart3,
      action: () => executeDirectAction('getSystemStats', {}),
      permission: 'ver_reporte'
    },
    {
      id: 'search',
      title: 'Buscar Reportes',
      description: 'Búsqueda inteligente',
      icon: Search,
      action: () => processIntelligentQuery('mostrar todos los reportes'),
      permission: 'ver_reporte'
    },
    {
      id: 'create',
      title: 'Crear Reporte',
      description: 'Nuevo reporte rápido',
      icon: Plus,
      action: () => processIntelligentQuery('crear reporte "Nuevo reporte desde asistente"'),
      permission: 'crear_reporte'
    },
    {
      id: 'map',
      title: 'Ver Mapa',
      description: 'Reportes geográficos',
      icon: Map,
      action: () => executeDirectAction('getReportsByLocation', {}),
      permission: null
    },
    {
      id: 'analysis',
      title: 'Generar Análisis',
      description: 'Reporte completo',
      icon: Brain,
      action: () => executeDirectAction('generateAnalysis', {}),
      permission: 'ver_reporte'
    }
  ];

  const availableActions = quickActions.filter(action => 
    !action.permission || hasPermission(action.permission as any)
  );

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Entrada de consulta inteligente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Asistente Inteligente
          </CardTitle>
          <CardDescription>
            Escribe en lenguaje natural lo que necesitas hacer en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Ej: 'crear reporte urgente', 'mostrar estadísticas', 'buscar reportes de agua'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? <Clock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Ejemplos:</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuery('mostrar estadísticas del sistema')}
              disabled={isLoading}
            >
              Ver estadísticas
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuery('buscar reportes urgentes')}
              disabled={isLoading}
            >
              Reportes urgentes
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuery('crear reporte de emergencia')}
              disabled={isLoading}
            >
              Nuevo reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>
            Ejecuta acciones comunes con un clic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-20 p-3"
                  onClick={action.action}
                  disabled={isLoading}
                >
                  <IconComponent className="h-5 w-5" />
                  <div className="text-center">
                    <p className="text-xs font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Historial de respuestas */}
      {responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Acciones</CardTitle>
            <CardDescription>
              Últimas consultas procesadas por el asistente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {responses.map((response) => (
                  <div key={response.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">
                          {response.query}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {response.response}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {response.actionExecuted ? (
                          response.actionResult?.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )
                        ) : (
                          <Brain className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(response.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    {response.actionExecuted && (
                      <Badge variant={response.actionResult?.success ? "default" : "destructive"}>
                        {response.actionResult?.success ? "Ejecutado" : "Error"}
                      </Badge>
                    )}
                    
                    {response.data && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-blue-600">
                          Ver datos obtenidos
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Información de permisos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tus Permisos Actuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {userPermissions.map((permission) => (
              <Badge key={permission} variant="outline" className="text-xs">
                {permission}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentActions;
