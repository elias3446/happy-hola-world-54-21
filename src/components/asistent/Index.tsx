
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, User, Send, Trash, Database, FileText, Brain, Zap, BarChart3, Sparkles } from 'lucide-react';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import { useIntelligentAssistant } from '@/hooks/useIntelligentAssistant';
import { useSecurity } from '@/hooks/useSecurity';
import MemoryViewer from '@/components/asistent/MemoryViewer';
import DocumentUploader from '@/components/asistent/DocumentUploader';
import SystemActionsHandler from '@/components/asistent/SystemActionsHandler';
import SmartAnalyticsGenerator from '@/components/asistent/SmartAnalyticsGenerator';
import IntelligentActionsPanel from '@/components/asistent/IntelligentActionsPanel';
import IntelligentActions from '@/components/asistent/IntelligentActions';
import { Message } from '@/types/chat';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSecurity();
  const {
    messages,
    isLoading,
    sendMessage,
    apiKey,
    clearMemory,
    conversationContext,
    conversationMemory,
    isDocumentUploaderOpen,
    openDocumentUploader,
    closeDocumentUploader
  } = useGeminiChat();
  
  const {
    processIntelligentQuery,
    responses: intelligentResponses,
    isProcessing
  } = useIntelligentAssistant();
  
  const [inputValue, setInputValue] = useState('');
  const [isMemoryViewerOpen, setIsMemoryViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('intelligent');
  const [actionResults, setActionResults] = useState<any[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const rootElement = scrollAreaRef.current;
    if (rootElement) {
      const viewportElement = rootElement.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]');
      if (viewportElement) {
        viewportElement.scrollTo({ top: viewportElement.scrollHeight, behavior: 'smooth' });
      } else {
        rootElement.scrollTo({ top: rootElement.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages, intelligentResponses]);

  // Auto-focus input field when bot finishes loading
  useEffect(() => {
    if (!isLoading && !isProcessing && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isLoading, isProcessing]);

  const handleSendMessage = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (inputValue.trim() && !isLoading && !isProcessing) {
      if (activeTab === 'intelligent') {
        // Usar el asistente inteligente
        processIntelligentQuery(inputValue.trim());
      } else {
        // Usar el chat tradicional con Gemini
        sendMessage(inputValue.trim());
      }
      setInputValue('');
    }
  };

  const handleActionExecute = (action: string, params?: any) => {
    const result = {
      id: Date.now(),
      action,
      params,
      timestamp: new Date(),
      success: true
    };
    
    setActionResults(prev => [result, ...prev.slice(0, 9)]);
    
    // Notificar al chat principal sobre la acción
    const actionMessage = `He ejecutado la acción: ${action}${params ? ` con parámetros: ${JSON.stringify(params)}` : ''}`;
    setTimeout(() => {
      sendMessage(`ACCIÓN_EJECUTADA: ${actionMessage}`);
    }, 500);
  };

  const handleActionComplete = (result: any) => {
    setActionResults(prev => [result, ...prev.slice(0, 9)]);
    
    if (result.success) {
      toast({
        title: "Acción completada",
        description: result.message,
      });
    } else {
      toast({
        title: "Error en la acción",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleChartGenerated = (chartData: any) => {
    const message = `He generado un gráfico ${chartData.type}: ${chartData.title}`;
    sendMessage(`GRÁFICO_GENERADO: ${message}`);
    setActiveTab('chat');
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(date);
  }

  const getDocumentTitles = (docIds?: string[]) => {
    if (!docIds || docIds.length === 0) return null;
    
    return (
      <div className="mt-1 flex flex-wrap gap-1">
        <span className="text-xs text-muted-foreground mr-1">Fuentes:</span>
        {docIds.map((doc, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Doc {index + 1}
          </Badge>
        ))}
      </div>
    );
  };

  const getMessageVariant = (text: string) => {
    if (text.startsWith('PREGUNTAS ADICIONALES:')) {
      return 'question';
    } else if (text.startsWith('RECOMENDACIONES:')) {
      return 'recommendation';
    }
    return 'normal';
  };

  // Mensaje de bienvenida personalizado
  const getWelcomeMessage = () => {
    const isIntelligentTab = activeTab === 'intelligent';
    const hasContent = isIntelligentTab ? intelligentResponses.length > 0 : messages.length > 0;
    
    if (!hasContent) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <div className="flex justify-center mb-4">
            {isIntelligentTab ? (
              <Sparkles className="h-12 w-12 text-purple-500" />
            ) : (
              <Brain className="h-12 w-12 text-blue-500" />
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {isIntelligentTab ? '🤖 Asistente Inteligente' : '💬 Chat con Gemini'}
          </h3>
          <p className="text-sm max-w-md mx-auto mb-4">
            {isIntelligentTab 
              ? 'Escribe en lenguaje natural lo que necesitas hacer. Puedo ejecutar acciones reales del sistema, crear reportes, mostrar estadísticas y mucho más.'
              : 'Conversa con Gemini AI sobre cualquier tema. Tengo acceso a la información del sistema y tu historial de conversación.'
            }
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {isIntelligentTab ? (
              <>
                <Badge variant="outline">🎯 Acciones Directas</Badge>
                <Badge variant="outline">📊 Análisis en Tiempo Real</Badge>
                <Badge variant="outline">🗺️ Integración con Mapas</Badge>
                <Badge variant="outline">📋 Gestión de Reportes</Badge>
                <Badge variant="outline">👥 Administración de Usuarios</Badge>
              </>
            ) : (
              <>
                <Badge variant="outline">🔄 Acciones del Sistema</Badge>
                <Badge variant="outline">📊 Análisis Dinámicos</Badge>
                <Badge variant="outline">🎯 Sugerencias Contextuales</Badge>
                <Badge variant="outline">📈 Gráficos Interactivos</Badge>
                <Badge variant="outline">⚡ Gestión Inteligente</Badge>
              </>
            )}
          </div>
          <p className="text-xs mt-4 text-muted-foreground">
            {isIntelligentTab 
              ? 'Ejemplos: "crear reporte urgente", "mostrar estadísticas", "buscar reportes de agua"'
              : 'Usa las pestañas para acceder a diferentes funcionalidades o escribe tu consulta...'
            }
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header compacto con pestañas */}
      <div className="bg-muted/50 border-b p-2 flex-shrink-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-2">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="intelligent" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Directa
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="actions" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Acciones
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Análisis
              </TabsTrigger>
              <TabsTrigger value="tools" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Herramientas
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Contenido de las pestañas */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="intelligent" className="h-full m-0">
              <IntelligentActions />
            </TabsContent>

            <TabsContent value="chat" className="h-full m-0">
              {/* Chat principal */}
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  {getWelcomeMessage()}
                  
                  <div className="space-y-6">
                    {messages.map((msg: Message) => {
                      const messageVariant = msg.sender === 'bot' ? getMessageVariant(msg.text) : 'normal';
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end space-x-2 ${
                            msg.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {msg.sender === 'bot' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback><Bot size={20} /></AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.sender === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : messageVariant === 'question'
                                  ? 'bg-blue-100 text-blue-800 rounded-bl-none dark:bg-blue-900 dark:text-blue-100'
                                  : messageVariant === 'recommendation'
                                    ? 'bg-green-100 text-green-800 rounded-bl-none dark:bg-green-900 dark:text-green-100'
                                    : 'bg-muted text-muted-foreground rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {messageVariant === 'question' 
                                ? msg.text.replace('PREGUNTAS ADICIONALES:', '').trim() 
                                : messageVariant === 'recommendation'
                                  ? msg.text.replace('RECOMENDACIONES:', '').trim()
                                  : msg.text}
                            </p>
                            {msg.sender === 'bot' && getDocumentTitles(msg.retrievedDocuments)}
                            <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>
                              {formatTimestamp(msg.timestamp)}
                            </p>
                          </div>
                          {msg.sender === 'user' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback><User size={20} /></AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
                    
                    {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
                      <div className="flex items-end space-x-2 justify-start">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                        <div className="max-w-[80%] p-3 rounded-lg bg-muted text-muted-foreground rounded-bl-none">
                          <p className="text-sm italic">Analizando y procesando tu solicitud...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input de chat */}
                <div className="border-t bg-background p-4 flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder={activeTab === 'intelligent' 
                        ? "Escribe lo que necesitas hacer en el sistema..." 
                        : "Conversa con Gemini sobre cualquier tema..."
                      }
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-grow"
                      disabled={isLoading || isProcessing}
                      ref={inputRef}
                      autoFocus
                    />
                    <Button type="submit" disabled={isLoading || isProcessing || !inputValue.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  
                  {/* Estado del asistente */}
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {apiKey ? (
                        <Badge variant="outline" className="text-xs">
                          {activeTab === 'intelligent' ? '🤖 IA Directa' : '🧠 Gemini Chat'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">🔄 Conectando...</Badge>
                      )}
                      {isAdmin() && <Badge variant="secondary" className="text-xs">👑 Admin</Badge>}
                    </div>
                    <div>
                      {actionResults.length > 0 && (
                        <span>⚡ {actionResults.length} acciones recientes</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="h-full m-0">
              <ScrollArea className="h-full p-4">
                <IntelligentActionsPanel onActionExecute={handleActionExecute} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="h-full m-0">
              <ScrollArea className="h-full p-4">
                <SmartAnalyticsGenerator onChartGenerated={handleChartGenerated} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tools" className="h-full m-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={openDocumentUploader} variant="outline" size="sm">
                      <FileText className="mr-1 h-3 w-3" /> Documentos
                    </Button>
                    <Button onClick={() => setIsMemoryViewerOpen(true)} variant="outline" size="sm">
                      <Database className="mr-1 h-3 w-3" /> Memoria
                    </Button>
                    <Button onClick={clearMemory} variant="outline" size="sm">
                      <Trash className="mr-1 h-3 w-3" /> Limpiar
                    </Button>
                    <Button onClick={() => setActiveTab('intelligent')} variant="outline" size="sm">
                      <Sparkles className="mr-1 h-3 w-3" /> IA Directa
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Componentes ocultos para manejo de acciones */}
      <SystemActionsHandler onActionComplete={handleActionComplete} />

      {/* Modales */}
      <MemoryViewer
        isOpen={isMemoryViewerOpen}
        onClose={() => setIsMemoryViewerOpen(false)}
        conversationContext={conversationContext}
        conversationMemory={conversationMemory}
      />
      
      <DocumentUploader 
        isOpen={isDocumentUploaderOpen}
        onClose={closeDocumentUploader}
      />
    </div>
  );
};

export default Index;
