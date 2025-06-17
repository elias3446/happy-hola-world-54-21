
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

  const processIntelligentQuery = useCallback(async (query: string) => {
    if (!user || !query.trim()) return;

    setIsProcessing(true);
    
    try {
      // Primero intentar procesamiento local inteligente
      const parsed = await intelligentQueryParser.parseQuery(
        query, 
        user.id, 
        userPermissions
      );

      // Crear respuesta inicial
      const response: IntelligentResponse = {
        id: Date.now().toString(),
        query,
        response: parsed.naturalResponse,
        actionExecuted: parsed.action !== 'provide_help' && parsed.action !== 'permission_denied',
        actionResult: parsed.result,
        data: parsed.result?.data,
        timestamp: new Date()
      };

      setResponses(prev => [response, ...prev]);

      // Si se ejecutó una acción exitosa, mostrar notificación
      if (parsed.result?.success) {
        toast({
          title: "Acción completada",
          description: parsed.result.message,
        });
      } else if (parsed.result && !parsed.result.success) {
        toast({
          title: "Error en la acción",
          description: parsed.result.message || parsed.result.error,
          variant: "destructive",
        });
      }

      // Si la confianza es baja o necesita procesamiento adicional con Gemini
      if (parsed.confidence < 0.7 || parsed.action === 'provide_help') {
        // Enviar también a Gemini para obtener una respuesta más contextual
        const enhancedQuery = `
CONSULTA DEL USUARIO: "${query}"

CONTEXTO DEL SISTEMA:
- Usuario: ${user.email}
- Permisos: ${userPermissions.join(', ')}
- Acción identificada: ${parsed.action}
- Confianza: ${parsed.confidence}

${parsed.result?.data ? `DATOS OBTENIDOS: ${JSON.stringify(parsed.result.data, null, 2)}` : ''}

Por favor proporciona una respuesta más detallada y contextual, y sugiere acciones específicas que el usuario puede realizar.
        `;
        
        setTimeout(() => {
          sendGeminiMessage(enhancedQuery);
        }, 500);
      }

      return response;
    } catch (error) {
      console.error('Error procesando consulta inteligente:', error);
      
      const errorResponse: IntelligentResponse = {
        id: Date.now().toString(),
        query,
        response: 'Lo siento, ocurrió un error al procesar tu consulta. Intentaré con el asistente general.',
        actionExecuted: false,
        timestamp: new Date()
      };

      setResponses(prev => [errorResponse, ...prev]);

      // Fallback a Gemini
      setTimeout(() => {
        sendGeminiMessage(query);
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
          result = { success: false, message: `Acción "${actionName}" no reconocida` };
      }

      // Mostrar notificación del resultado
      if (result.success) {
        toast({
          title: "Acción completada",
          description: result.message,
        });
      } else {
        toast({
          title: "Error en la acción",
          description: result.message || result.error,
          variant: "destructive",
        });
      }

      // Crear respuesta para el historial
      const response: IntelligentResponse = {
        id: Date.now().toString(),
        query: `Acción directa: ${actionName}`,
        response: result.message,
        actionExecuted: true,
        actionResult: result,
        data: result.data,
        timestamp: new Date()
      };

      setResponses(prev => [response, ...prev]);
      return result;
    } catch (error) {
      console.error('Error ejecutando acción directa:', error);
      
      const errorResult = {
        success: false,
        message: 'Error interno al ejecutar la acción',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };

      toast({
        title: "Error",
        description: errorResult.message,
        variant: "destructive",
      });

      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  }, [user, hasPermission]);

  const clearHistory = useCallback(() => {
    setResponses([]);
  }, []);

  return {
    processIntelligentQuery,
    executeDirectAction,
    responses,
    isProcessing,
    isLoading: isProcessing || geminiLoading,
    clearHistory,
    userPermissions,
    hasPermission
  };
};
