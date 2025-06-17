
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import { intelligentQueryParser } from '@/services/intelligentQueryParser';
import { assistantActionService, ActionResult } from '@/services/assistantActionService';
import { toast } from '@/hooks/use-toast';

export interface IntelligentResponse {
  id: string;
  query: string;
  response: string;
  actionExecuted?: boolean;
  actionResult?: ActionResult;
  data?: any;
  timestamp: Date;
}

export const useIntelligentAssistant = () => {
  const { user } = useAuth();
  const { userPermissions, hasPermission } = useSecurity();
  const { sendMessage: sendGeminiMessage, isLoading: geminiLoading } = useGeminiChat();
  const [responses, setResponses] = useState<IntelligentResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mensaje de bienvenida inicial como JARVIS
  const getWelcomeMessage = (): IntelligentResponse => {
    const now = new Date();
    const hour = now.getHours();
    let greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
    
    return {
      id: 'welcome-jarvis',
      query: 'Inicialización',
      response: `${greeting}! 👋\n\nSoy JARVIS, tu asistente virtual para la gestión inteligente de reportes.\n\n🚀 Estoy aquí para ayudarte con:\n• 📝 Crear y gestionar reportes\n• 👥 Administrar usuarios y roles\n• 📊 Generar análisis y estadísticas\n• 🗺️ Visualizar datos en mapas\n• 🔍 Búsquedas y filtros avanzados\n\n¡Simplemente dime qué necesitas en lenguaje natural!`,
      actionExecuted: false,
      timestamp: now
    };
  };

  const processIntelligentQuery = useCallback(async (query: string) => {
    if (!user || !query.trim()) return;

    setIsProcessing(true);
    
    try {
      // Procesamiento con el contexto de JARVIS
      const parsed = await intelligentQueryParser.parseQuery(
        query, 
        user.id, 
        userPermissions
      );

      // Crear respuesta con el estilo conversacional de JARVIS
      const response: IntelligentResponse = {
        id: Date.now().toString(),
        query,
        response: parsed.naturalResponse,
        actionExecuted: parsed.action !== 'provide_help' && 
                        parsed.action !== 'permission_denied' && 
                        parsed.action !== 'welcome',
        actionResult: parsed.result,
        data: parsed.result?.data,
        timestamp: new Date()
      };

      setResponses(prev => [response, ...prev]);

      // Notificaciones con estilo JARVIS
      if (parsed.result?.success && parsed.actionExecuted) {
        toast({
          title: "✅ Acción completada",
          description: "JARVIS ha ejecutado tu solicitud exitosamente",
        });
      } else if (parsed.result && !parsed.result.success && parsed.actionExecuted) {
        toast({
          title: "⚠️ Problema detectado",
          description: parsed.result.message || parsed.result.error,
          variant: "destructive",
        });
      }

      // Si la confianza es baja, usar Gemini como respaldo con contexto de JARVIS
      if (parsed.confidence < 0.6 && parsed.action === 'provide_help') {
        const enhancedQuery = `
Como JARVIS, asistente virtual de gestión de reportes, el usuario me pregunta: "${query}"

CONTEXTO DEL USUARIO:
- Email: ${user.email}
- Permisos disponibles: ${userPermissions.join(', ')}
- Módulos disponibles: Reportes, Usuarios, Roles, Categorías, Estados, Auditoría, Dashboard

${parsed.result?.data ? `DATOS DEL SISTEMA: ${JSON.stringify(parsed.result.data, null, 2)}` : ''}

Responde como JARVIS de manera conversacional, amigable y usando emojis apropiados. 
Sugiere acciones específicas que el usuario puede realizar en el sistema.
Mantén el tono como si fuera una conversación de WhatsApp.
        `;
        
        setTimeout(() => {
          sendGeminiMessage(enhancedQuery);
        }, 500);
      }

      return response;
    } catch (error) {
      console.error('Error procesando consulta con JARVIS:', error);
      
      const errorResponse: IntelligentResponse = {
        id: Date.now().toString(),
        query,
        response: '😅 Ups, tuve un pequeño problema técnico. Déjame intentar con mi sistema de respaldo...\n\n¿Podrías repetir tu solicitud?',
        actionExecuted: false,
        timestamp: new Date()
      };

      setResponses(prev => [errorResponse, ...prev]);

      // Fallback a Gemini con contexto de JARVIS
      setTimeout(() => {
        const fallbackQuery = `Como JARVIS, el usuario pregunta: "${query}". Responde de manera conversacional y amigable como un asistente de WhatsApp.`;
        sendGeminiMessage(fallbackQuery);
      }, 500);

      return errorResponse;
    } finally {
      setIsProcessing(false);
    }
  }, [user, userPermissions, sendGeminiMessage]);

  const executeDirectAction = useCallback(async (actionName: string, parameters: any) => {
    if (!user) return;

    setIsProcessing(true);
    let result: ActionResult;

    try {
      switch (actionName) {
        case 'getSystemStats':
          result = await assistantActionService.getSystemStats();
          break;
        case 'searchReports':
          result = await assistantActionService.searchReports(parameters);
          break;
        case 'createReport':
          if (!hasPermission('crear_reporte')) {
            result = { success: false, message: 'No tienes permisos para crear reportes' };
          } else {
            result = await assistantActionService.createReport(parameters, user.id);
          }
          break;
        case 'getReportsByLocation':
          result = await assistantActionService.getReportsByLocation(parameters);
          break;
        case 'generateAnalysis':
          result = await assistantActionService.generateAnalysisReport();
          break;
        default:
          result = { success: false, message: `Acción "${actionName}" no reconocida por JARVIS` };
      }

      // Notificaciones estilo JARVIS
      if (result.success) {
        toast({
          title: "🎯 JARVIS - Acción completada",
          description: result.message,
        });
      } else {
        toast({
          title: "⚠️ JARVIS - Problema detectado",
          description: result.message || result.error,
          variant: "destructive",
        });
      }

      // Crear respuesta conversacional
      const response: IntelligentResponse = {
        id: Date.now().toString(),
        query: `Acción directa: ${actionName}`,
        response: result.success 
          ? `✅ ${result.message}` 
          : `❌ ${result.message || result.error}`,
        actionExecuted: true,
        actionResult: result,
        data: result.data,
        timestamp: new Date()
      };

      setResponses(prev => [response, ...prev]);
      return result;
    } catch (error) {
      console.error('Error ejecutando acción directa en JARVIS:', error);
      
      const errorResult = {
        success: false,
        message: 'JARVIS encontró un error interno al ejecutar la acción',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };

      toast({
        title: "🔧 JARVIS - Error técnico",
        description: errorResult.message,
        variant: "destructive",
      });

      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  }, [user, hasPermission]);

  const initializeJarvis = useCallback(() => {
    if (responses.length === 0) {
      const welcomeMessage = getWelcomeMessage();
      setResponses([welcomeMessage]);
    }
  }, [responses.length]);

  const clearHistory = useCallback(() => {
    setResponses([]);
    // Reinicializar con mensaje de bienvenida
    setTimeout(() => {
      const welcomeMessage = getWelcomeMessage();
      setResponses([welcomeMessage]);
    }, 100);
  }, []);

  return {
    processIntelligentQuery,
    executeDirectAction,
    responses,
    isProcessing,
    isLoading: isProcessing || geminiLoading,
    clearHistory,
    initializeJarvis,
    userPermissions,
    hasPermission
  };
};
