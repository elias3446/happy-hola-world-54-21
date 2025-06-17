
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, User, Send, KeyRound, Trash, Database, FileText, BarChart3, Zap, Map } from 'lucide-react';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import { useSecurity } from '@/hooks/useSecurity';
import ApiKeyModal from '@/components/asistent/ApiKeyModal';
import MemoryViewer from '@/components/asistent/MemoryViewer';
import DocumentUploader from '@/components/asistent/DocumentUploader';
import AssistantDashboard from '@/components/asistent/AssistantDashboard';
import ReportsTracker from '@/components/asistent/ReportsTracker';
import ContextualActions from '@/components/asistent/ContextualActions';
import { Message } from '@/types/chat';
import { Badge } from "@/components/ui/badge";
import { ragService } from '@/services/ragService';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { hasPermission, isAdmin } = useSecurity();
  const {
    messages,
    isLoading,
    sendMessage,
    isApiKeyModalOpen,
    openApiKeyModal,
    closeApiKeyModal,
    saveApiKey,
    apiKey,
    clearMemory,
    conversationContext,
    conversationMemory,
    isDocumentUploaderOpen,
    openDocumentUploader,
    closeDocumentUploader
  } = useGeminiChat();
  
  const [inputValue, setInputValue] = useState('');
  const [isMemoryViewerOpen, setIsMemoryViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
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
  }, [messages]);

  // Auto-focus input field when bot finishes loading
  useEffect(() => {
    // When isLoading changes from true to false, it means the bot has responded
    // And we should focus the input field again
    if (!isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'bot') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // Small timeout to ensure UI has been updated
    }
  }, [isLoading, messages]);

  const handleSendMessage = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(date);
  }

  const getDocumentTitles = (docIds?: string[]) => {
    if (!docIds || docIds.length === 0) return null;
    
    const allDocs = ragService.getDocuments();
    const docs = docIds.map(id => allDocs.find(doc => doc.id === id))
                       .filter(Boolean);
    
    if (docs.length === 0) return null;
    
    return (
      <div className="mt-1 flex flex-wrap gap-1">
        <span className="text-xs text-muted-foreground mr-1">Fuentes:</span>
        {docs.map((doc, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            {doc?.metadata?.title || `Doc ${index + 1}`}
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

  // Handlers para acciones del asistente
  const handleActionSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setActiveTab('chat');
    // Auto-enviar la sugerencia
    setTimeout(() => {
      if (apiKey) {
        sendMessage(suggestion);
        setInputValue('');
      }
    }, 100);
  };

  const handleReportClick = (reportId: string) => {
    navigate(`/reportes/${reportId}`);
    toast({
      title: "Navegando al reporte",
      description: "Abriendo detalles del reporte seleccionado"
    });
  };

  const handleActionExecute = (action: string, params?: any) => {
    switch (action) {
      case 'navigate':
        navigate(params);
        toast({
          title: "Navegando",
          description: `Dirigiendo a ${params}`
        });
        break;
      case 'show-analytics':
        setActiveTab('dashboard');
        toast({
          title: "Analíticas",
          description: "Mostrando panel de analíticas"
        });
        break;
      case 'export-data':
        toast({
          title: "Exportar datos",
          description: "Función de exportación en desarrollo"
        });
        break;
      case 'configure-notifications':
        toast({
          title: "Configurar notificaciones",
          description: "Función de configuración en desarrollo"
        });
        break;
      default:
        console.log('Acción no reconocida:', action, params);
    }
  };

  // Determinar qué tabs mostrar según permisos
  const availableTabs = [
    { id: 'chat', label: 'Chat', icon: Bot },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, permission: 'ver_reporte' },
    { id: 'reports', label: 'Reportes', icon: FileText, permission: 'ver_reporte' },
    { id: 'actions', label: 'Acciones', icon: Zap },
  ].filter(tab => !tab.permission || hasPermission(tab.permission as any));

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full max-w-6xl mx-auto bg-background shadow-xl rounded-lg overflow-hidden">
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Asistente Inteligente</h1>
          {isAdmin() && <Badge variant="secondary">Admin</Badge>}
        </div>
        <div className="flex space-x-2">
          <Button onClick={openDocumentUploader} variant="secondary" size="sm">
            <FileText className="mr-2 h-4 w-4" /> Documentos
          </Button>
          <Button onClick={() => setIsMemoryViewerOpen(true)} variant="secondary" size="sm">
            <Database className="mr-2 h-4 w-4" /> Ver Memoria
          </Button>
          <Button onClick={clearMemory} variant="secondary" size="sm">
            <Trash className="mr-2 h-4 w-4" /> Borrar Memoria
          </Button>
          <Button onClick={openApiKeyModal} variant="secondary" size="sm">
            <KeyRound className="mr-2 h-4 w-4" /> API Key
          </Button>
        </div>
      </header>

      <div className="flex-grow overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-4">
              {availableTabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="flex-grow overflow-hidden">
            <TabsContent value="chat" className="h-full flex flex-col mt-0">
              <ScrollArea className="flex-grow p-6 space-y-8" ref={scrollAreaRef}>
                {messages.map((msg: Message) => {
                  const messageVariant = msg.sender === 'bot' ? getMessageVariant(msg.text) : 'normal';
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end space-x-2 ${
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      } mb-6`}
                    >
                      {msg.sender === 'bot' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
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
                {isLoading && messages.length > 0 && messages[messages.length -1].sender === 'user' && (
                  <div className="flex items-end space-x-2 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot size={20} /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-[70%] p-3 rounded-lg bg-muted text-muted-foreground rounded-bl-none">
                      <p className="text-sm italic">Gemini está pensando...</p>
                    </div>
                  </div>
                )}
              </ScrollArea>

              <footer className="bg-background border-t p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder={apiKey ? "Escribe tu mensaje..." : "Configura tu API Key primero..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-grow"
                    disabled={isLoading || !apiKey}
                    ref={inputRef}
                    autoFocus
                  />
                  <Button type="submit" disabled={isLoading || !inputValue.trim() || !apiKey}>
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Enviar</span>
                  </Button>
                </form>
              </footer>
            </TabsContent>

            <TabsContent value="dashboard" className="h-full overflow-auto p-4">
              <AssistantDashboard onActionSuggestion={handleActionSuggestion} />
            </TabsContent>

            <TabsContent value="reports" className="h-full overflow-auto p-4">
              <ReportsTracker onReportClick={handleReportClick} />
            </TabsContent>

            <TabsContent value="actions" className="h-full overflow-auto p-4">
              <ContextualActions onActionExecute={handleActionExecute} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={closeApiKeyModal}
        onSave={saveApiKey}
      />
      
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
