import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import { intelligentQueryParser } from '@/services/intelligentQueryParser';
import { assistantActionService, ActionResult } from '@/services/assistantActionService';
import { assistantPermissionService, UserPermissionInfo } from '@/services/assistantPermissionService';
import { toast } from '@/hooks/use-toast';

export interface IntelligentResponse {
  id: string;
  query: string;
  response: string;
  actionExecuted?: boolean;
  actionResult?: ActionResult;
  data?: any;
  timestamp: Date;
  userInfo?: UserPermissionInfo;
}

export const useIntelligentAssistant = () => {
  const { user } = useAuth();
  const { userPermissions, hasPermission } = useSecurity();
  const { sendMessage: sendGeminiMessage, isLoading: geminiLoading } = useGeminiChat();
  const [responses, setResponses] = useState<IntelligentResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState<UserPermissionInfo | null>(null);

  // Mensaje de bienvenida inicial como JARVIS con información del usuario
  const getWelcomeMessage = async (): Promise<IntelligentResponse> => {
    const now = new Date();
    const hour = now.getHours();
    let greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
    
    // Obtener información actualizada del usuario
    const userInfo = await assistantPermissionService.getCurrentUserPermissions();
    setCurrentUserInfo(userInfo);
    
    const userName = userInfo?.firstName || userInfo?.email?.split('@')[0] || 'Usuario';
    const roleInfo = userInfo?.roles.map(role => role.nombre).join(', ') || 'Sin roles asignados';
    
    return {
      id: 'welcome-jarvis',
      query: 'Inicialización',
      response: `${greeting}, ${userName}! 👋\n\nSoy JARVIS, tu asistente virtual para la gestión inteligente de reportes.\n\n👤 **Tu información:**\n• Email: ${userInfo?.email}\n• Roles: ${roleInfo}\n• Permisos: ${userInfo?.permissions.length || 0} permisos activos\n• Nivel: ${userInfo?.isAdmin ? 'Administrador 🔑' : 'Usuario estándar 👤'}\n\n🚀 **Estoy aquí para ayudarte con:**\n• 📝 Crear y gestionar reportes\n• 👥 Administrar usuarios y roles ${userInfo?.isAdmin ? '(disponible)' : '(requiere permisos)'}\n• 📊 Generar análisis y estadísticas\n• 🗺️ Visualizar datos en mapas\n• 🔍 Búsquedas y filtros avanzados\n\n¡Simplemente dime qué necesitas en lenguaje natural!`,
      actionExecuted: false,
      timestamp: now,
      userInfo: userInfo || undefined
    };
  };

  const processIntelligentQuery = useCallback(async (query: string) => {
    if (!user || !query.trim()) return;

    setIsProcessing(true);
    
    try {
      // Obtener información actualizada de permisos antes de procesar
      const userInfo = await assistantPermissionService.getCurrentUserPermissions();
      setCurrentUserInfo(userInfo);

      if (!userInfo) {
        const errorResponse: IntelligentResponse = {
          id: Date.now().toString(),
          query,
          response: '🔒 No puedo verificar tus permisos en este momento. Por favor, verifica que estés autenticado correctamente.',
          actionExecuted: false,
          timestamp: new Date()
        };
        setResponses(prev => [errorResponse, ...prev]);
        return errorResponse;
      }

      // Procesamiento con el contexto de JARVIS y permisos del usuario
      const parsed = await intelligentQueryParser.parseQuery(
        query, 
        user.id, 
        userInfo.permissions
      );

      // Verificar permisos antes de ejecutar la acción si es necesaria
      let permissionCheck = { canExecute: true, reason: undefined };
      if (parsed.action !== 'provide_help' && parsed.action !== 'welcome') {
        permissionCheck = await assistantPermissionService.canExecuteAction(parsed.action);
        
        // Registrar la verificación de permisos
        await assistantPermissionService.logPermissionCheck(
          parsed.action, 
          permissionCheck.canExecute, 
          user.id
        );
      }

      // Si no tiene permisos, modificar la respuesta
      if (!permissionCheck.canExecute) {
        const deniedResponse: IntelligentResponse = {
          id: Date.now().toString(),
          query,
          response: `🚫 **Acceso denegado**\n\nLo siento ${userInfo.firstName || userInfo.email.split('@')[0]}, no tienes permisos para realizar esta acción.\n\n**Motivo:** ${permissionCheck.reason}\n\n**Tus roles actuales:** ${userInfo.roles.map(r => r.nombre).join(', ')}\n\n¿Necesitas que contacte a un administrador para solicitar estos permisos? 🤔`,
          actionExecuted: false,
          actionResult: { success: false, message: permissionCheck.reason || 'Sin permisos' },
          timestamp: new Date(),
          userInfo
        };

        setResponses(prev => [deniedResponse, ...prev]);
        
        toast({
          title: "🚫 Permisos insuficientes",
          description: `JARVIS: ${permissionCheck.reason}`,
          variant: "destructive",
        });

        return deniedResponse;
      }

      // Determinar si se ejecutó una acción basado en el tipo de acción
      const actionExecuted = parsed.action !== 'provide_help' && 
                            parsed.action !== 'permission_denied' && 
                            parsed.action !== 'welcome';

      // Crear respuesta con el estilo conversacional de JARVIS
      const response: IntelligentResponse = {
        id: Date.now().toString(),
        query,
        response: parsed.naturalResponse,
        actionExecuted,
        actionResult: parsed.result,
        data: parsed.result?.data,
        timestamp: new Date(),
        userInfo
      };

      setResponses(prev => [response, ...prev]);

      // Notificaciones con estilo JARVIS
      if (parsed.result?.success && actionExecuted) {
        toast({
          title: "✅ Acción completada",
          description: `JARVIS ha ejecutado tu solicitud exitosamente, ${userInfo.firstName || userInfo.email.split('@')[0]}`,
        });
      } else if (parsed.result && !parsed.result.success && actionExecuted) {
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
- Email: ${userInfo.email}
- Nombre: ${userInfo.firstName || 'No especificado'} ${userInfo.lastName || ''}
- Es Administrador: ${userInfo.isAdmin ? 'Sí' : 'No'}
- Roles: ${userInfo.roles.map(r => r.nombre).join(', ')}
- Permisos disponibles: ${userInfo.permissions.join(', ')}
- Módulos disponibles: Reportes, Usuarios, Roles, Categorías, Estados, Auditoría, Dashboard

${parsed.result?.data ? `DATOS DEL SISTEMA: ${JSON.stringify(parsed.result.data, null, 2)}` : ''}

Responde como JARVIS de manera conversacional, amigable y usando emojis apropiados. 
Sugiere acciones específicas que el usuario puede realizar en el sistema basándote en sus permisos.
Mantén el tono como si fuera una conversación de WhatsApp.
Si el usuario no tiene permisos para algo, sugiérele alternativas que sí puede hacer.
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
  }, [user, sendGeminiMessage]);

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

  const initializeJarvis = useCallback(async () => {
    if (responses.length === 0) {
      const welcomeMessage = await getWelcomeMessage();
      setResponses([welcomeMessage]);
    }
  }, [responses.length]);

  const clearHistory = useCallback(async () => {
    setResponses([]);
    // Reinicializar con mensaje de bienvenida
    setTimeout(async () => {
      const welcomeMessage = await getWelcomeMessage();
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
    hasPermission,
    currentUserInfo
  };
};
