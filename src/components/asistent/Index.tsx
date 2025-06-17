
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, KeyRound, Trash, Database, FileText, Brain } from 'lucide-react';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import { useSecurity } from '@/hooks/useSecurity';
import ApiKeyModal from '@/components/asistent/ApiKeyModal';
import MemoryViewer from '@/components/asistent/MemoryViewer';
import DocumentUploader from '@/components/asistent/DocumentUploader';
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
    if (!isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'bot') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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
    if (messages.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">¡Bienvenido al Asistente Inteligente!</h3>
          <p className="text-sm max-w-md mx-auto mb-4">
            Puedo ayudarte con la gestión completa del sistema: reportes, usuarios, roles, categorías, estados y auditoría.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <Badge variant="outline">📊 Análisis de reportes</Badge>
            <Badge variant="outline">👥 Gestión de usuarios</Badge>
            <Badge variant="outline">🔐 Control de roles</Badge>
            <Badge variant="outline">📁 Organización de categorías</Badge>
            <Badge variant="outline">⚡ Estados de flujo</Badge>
            <Badge variant="outline">🔍 Auditoría completa</Badge>
          </div>
          <p className="text-xs mt-4 text-muted-foreground">
            Escribe tu consulta para comenzar...
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header de herramientas compacto */}
      <div className="bg-muted/50 border-b p-2 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Herramientas:</h3>
        </div>
        <div className="flex gap-1">
          <Button onClick={openDocumentUploader} variant="outline" size="sm" className="h-8 text-xs">
            <FileText className="mr-1 h-3 w-3" /> Docs
          </Button>
          <Button onClick={() => setIsMemoryViewerOpen(true)} variant="outline" size="sm" className="h-8 text-xs">
            <Database className="mr-1 h-3 w-3" /> Memoria
          </Button>
          <Button onClick={clearMemory} variant="outline" size="sm" className="h-8 text-xs">
            <Trash className="mr-1 h-3 w-3" /> Limpiar
          </Button>
          <Button onClick={openApiKeyModal} variant="outline" size="sm" className="h-8 text-xs">
            <KeyRound className="mr-1 h-3 w-3" /> API
          </Button>
        </div>
      </div>

      {/* Área de chat principal */}
      <div className="flex-1 overflow-hidden flex flex-col">
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

        {/* Input de chat en la parte inferior */}
        <div className="border-t bg-background p-4 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder={apiKey ? "Pregúntame sobre reportes, usuarios, roles, categorías, estados o auditoría..." : "Configura tu API Key primero..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow"
              disabled={isLoading || !apiKey}
              ref={inputRef}
              autoFocus
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim() || !apiKey}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
          
          {/* Indicador de estado */}
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {apiKey ? (
                <Badge variant="outline" className="text-xs">🟢 IA Conectada</Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">🔴 API Key requerida</Badge>
              )}
              {isAdmin() && <Badge variant="secondary" className="text-xs">Admin</Badge>}
            </div>
            <div>
              {conversationContext && (
                <span>💾 Contexto guardado</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
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
