
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import AssistantIndex from './Index';

const IntelligentChat: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, userPermissions } = useSecurity();

  return (
    <div className="h-full flex flex-col">
      {/* Header mejorado del chat */}
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Chat con IA Contextual
              </CardTitle>
              <CardDescription>
                Asistente inteligente con acceso completo a tus datos y permisos
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Contexto Activo
              </Badge>
              {isAdmin() && (
                <Badge variant="secondary">Admin</Badge>
              )}
            </div>
          </div>
          
          {/* Indicadores de contexto */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              {userPermissions.length} permisos activos
            </Badge>
            <Badge variant="outline" className="text-xs">
              Acceso a reportes y analytics
            </Badge>
            <Badge variant="outline" className="text-xs">
              RAG habilitado
            </Badge>
            <Badge variant="outline" className="text-xs">
              Memoria conversacional
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Chat component */}
      <div className="flex-1 overflow-hidden">
        <AssistantIndex />
      </div>
    </div>
  );
};

export default IntelligentChat;
