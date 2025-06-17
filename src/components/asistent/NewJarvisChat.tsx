
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Paperclip, Smile, Mic } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useJarvisAssistant } from '@/hooks/useJarvisAssistant';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const NewJarvisChat: React.FC = () => {
  const [input, setInput] = useState('');
  const { conversations, isProcessing, sendMessage } = useJarvisAssistant();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando lleguen nuevos mensajes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [conversations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: es });
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5]">
      {/* Área de mensajes */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-2">
        <div className="space-y-3 max-w-4xl mx-auto">
          {/* Estado inicial vacío */}
          {conversations.length === 0 && !isProcessing && (
            <div className="text-center py-8">
              <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <p className="text-lg font-medium mb-2 text-gray-900">¡Hola! Soy JARVIS</p>
                <p className="text-sm text-gray-600">
                  Tu asistente virtual para gestión de reportes. ¿En qué puedo ayudarte hoy?
                </p>
              </div>
            </div>
          )}
          
          {/* Mostrar conversaciones en orden inverso (más reciente arriba) */}
          {conversations.slice().reverse().map((conversation) => (
            <div key={conversation.id} className="space-y-3">
              {/* Mensaje del usuario */}
              <div className="flex justify-end">
                <div className="max-w-[70%] bg-[#d9fdd3] rounded-lg px-3 py-2 shadow-sm">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                    {conversation.userQuery}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.timestamp)}
                    </span>
                    <div className="flex">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full ml-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Respuesta de JARVIS */}
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[70%]">
                  <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-green-600 text-white text-xs font-medium">
                      🤖
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                        {conversation.response}
                      </p>
                      
                      {/* Información adicional del usuario si está disponible */}
                      {conversation.userInfo && conversation.userInfo.email && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border-l-4 border-blue-500">
                          <div className="text-xs text-gray-600">
                            <div className="font-medium">Contexto de usuario:</div>
                            <div>Email: {conversation.userInfo.email}</div>
                            <div>Roles: {conversation.userInfo.roles?.map(r => r.nombre).join(', ') || 'Sin roles'}</div>
                            <div>Permisos: {conversation.userInfo.allPermissions?.length || 0} disponibles</div>
                            <div>Admin: {conversation.userInfo.isAdmin ? 'Sí' : 'No'}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-end">
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Indicador de carga */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-green-600 text-white text-xs font-medium">
                    🤖
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500">JARVIS está procesando...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Área de entrada */}
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
                placeholder="Pregúntale a JARVIS sobre reportes, usuarios, permisos..."
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

export default NewJarvisChat;
