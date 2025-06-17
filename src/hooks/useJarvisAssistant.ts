
import { useState, useCallback } from 'react';
import { jarvisIntelligenceService, JarvisResponse } from '@/services/jarvisIntelligenceService';
import { toast } from '@/hooks/use-toast';

export const useJarvisAssistant = () => {
  const [conversations, setConversations] = useState<JarvisResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeJarvis = useCallback(async () => {
    if (isInitialized || conversations.length > 0) return;
    
    console.log('🚀 Inicializando JARVIS...');
    setIsProcessing(true);
    
    try {
      const welcomeMessage = await jarvisIntelligenceService.generateWelcomeMessage();
      setConversations([welcomeMessage]);
      setIsInitialized(true);
      
      console.log('✅ JARVIS inicializado correctamente');
    } catch (error) {
      console.error('💥 Error inicializando JARVIS:', error);
      toast({
        title: "Error de inicialización",
        description: "No se pudo inicializar JARVIS. Verifica tu conexión.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, conversations.length]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isProcessing) return;

    console.log('📤 Enviando mensaje a JARVIS:', message);
    setIsProcessing(true);

    try {
      const response = await jarvisIntelligenceService.processUserQuery(message);
      
      setConversations(prev => [response, ...prev]);
      
      // Mostrar notificación según el resultado
      if (response.actionPerformed) {
        toast({
          title: "✅ Acción completada",
          description: `JARVIS ejecutó tu solicitud: ${message.substring(0, 50)}...`,
        });
      }
      
      console.log('✅ Respuesta de JARVIS procesada');
      
    } catch (error) {
      console.error('💥 Error enviando mensaje a JARVIS:', error);
      
      toast({
        title: "Error de comunicación",
        description: "JARVIS no pudo procesar tu mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const clearConversation = useCallback(() => {
    setConversations([]);
    setIsInitialized(false);
    console.log('🗑️ Conversación con JARVIS limpiada');
  }, []);

  return {
    conversations,
    isProcessing,
    isInitialized,
    initializeJarvis,
    sendMessage,
    clearConversation
  };
};
