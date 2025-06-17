
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Paperclip, Smile, Mic } from 'lucide-react';
import { useIntelligentAssistant } from '@/hooks/useIntelligentAssistant';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const IntelligentChat: React.FC = () => {
  const [input, setInput] = useState('');
  const { processIntelligentQuery, responses, isProcessing, initializeJarvis } = useIntelligentAssistant();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Inicializar JARVIS al montar el componente
  useEffect(() => {
    initializeJarvis();
  }, [initializeJarvis]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [responses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const query = input.trim();
    setInput('');
    await processIntelligentQuery(query);
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: es });
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5]">
      {/* Messages Area - WhatsApp style */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-2">
        <div className="space-y-2 max-w-4xl mx-auto">
          {responses.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <p className="text-lg font-medium mb-2 text-gray-900">¡Hola! Soy JARVIS</p>
                <p className="text-sm text-gray-600">
                  Tu asistente virtual para gestión de reportes. 
                  Escribe tu consulta y te ayudaré de inmediato.
                </p>
              </div>
            </div>
          )}
          
          {responses.slice().reverse().map((response) => (
            <div key={response.id} className="space-y-2">
              {/* User Message - WhatsApp style */}
              <div className="flex justify-end">
                <div className="max-w-[70%] bg-[#d9fdd3] rounded-lg px-3 py-2 shadow-sm">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">{response.query}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs text-gray-500">{formatTime(response.timestamp)}</span>
                    <div className="flex">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full ml-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assistant Response - WhatsApp style */}
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[70%]">
                  <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-green-600 text-white text-xs font-medium">
                      JA
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">{response.response}</p>
                      
                      {response.actionExecuted && response.actionResult && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border-l-4 border-green-500">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              response.actionResult.success ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-xs font-medium text-gray-700">
                              {response.actionResult.success ? 'Acción completada' : 'Error en acción'}
                            </span>
                          </div>
                          
                          {response.data && (
                            <div className="mt-2 text-xs text-gray-600">
                              <div className="bg-white p-2 rounded text-xs font-mono">
                                {JSON.stringify(response.data, null, 2)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-end">
                        <span className="text-xs text-gray-500">{formatTime(response.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator - WhatsApp style */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-green-600 text-white text-xs font-medium">
                    JA
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500">JARVIS está escribiendo...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area - WhatsApp style */}
      <div className="bg-[#f0f2f5] p-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 bg-white rounded-full border border-gray-300 flex items-center px-4 py-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={isProcessing}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
              />
              
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            {input.trim() ? (
              <Button 
                type="submit" 
                disabled={isProcessing}
                className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700"
                size="icon"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            ) : (
              <Button 
                type="button" 
                className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700"
                size="icon"
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default IntelligentChat;
