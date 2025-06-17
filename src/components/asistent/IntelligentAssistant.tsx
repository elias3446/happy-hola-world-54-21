
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import { Badge } from "@/components/ui/badge";
import { Brain, Zap } from 'lucide-react';
import AssistantIndex from './Index';

const IntelligentAssistant: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, userPermissions } = useSecurity();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) greeting = "Buenos días";
    else if (hour < 18) greeting = "Buenas tardes";
    else greeting = "Buenas noches";

    const userName = user?.email?.split('@')[0] || 'Usuario';
    return `${greeting}, ${userName}`;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Header minimalista */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Asistente Inteligente</h1>
                <p className="text-white/80 text-sm">{getWelcomeMessage()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin() && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Admin
                </Badge>
              )}
              <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                <Zap className="h-3 w-3 mr-1" />
                IA Completa
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Chat que ocupa todo el espacio disponible */}
      <div className="flex-1 overflow-hidden">
        <AssistantIndex />
      </div>
    </div>
  );
};

export default IntelligentAssistant;
