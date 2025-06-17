
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Bot, User } from 'lucide-react';
import { useIntelligentAssistant } from '@/hooks/useIntelligentAssistant';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const IntelligentChat: React.FC = () => {
  const [input, setInput] = useState('');
  const { processIntelligentQuery, responses, isProcessing } = useIntelligentAssistant();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
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
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {responses.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">¡Hola! Soy tu asistente virtual</p>
              <p className="text-sm max-w-md mx-auto">
                Puedo ayudarte con reportes, usuarios, análisis, estadísticas y mucho más. 
                Solo pregúntame o pídeme que realice alguna acción.
              </p>
            </div>
          )}
          
          {responses.map((response) => (
            <div key={response.id} className="space-y-3">
              {/* User Query */}
              <div className="flex justify-end">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <Card className="p-3 bg-primary text-primary-foreground">
                    <p className="text-sm whitespace-pre-wrap">{response.query}</p>
                  </Card>
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatTime(response.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assistant Response */}
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatTime(response.timestamp)}
                    </span>
                  </div>
                  <Card className="p-3 bg-muted">
                    <div className="space-y-2">
                      <p className="text-sm whitespace-pre-wrap">{response.response}</p>
                      
                      {response.actionExecuted && response.actionResult && (
                        <div className="mt-3 p-2 bg-background rounded border">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`h-2 w-2 rounded-full ${
                              response.actionResult.success ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-xs font-medium">
                              {response.actionResult.success ? 'Acción completada' : 'Error en acción'}
                            </span>
                          </div>
                          
                          {response.data && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <pre className="whitespace-pre-wrap font-mono text-xs">
                                {JSON.stringify(response.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-1 mt-1">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <Card className="p-3 bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Procesando...</span>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntame algo o pídeme que realice una acción..."
            disabled={isProcessing}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isProcessing}
            size="icon"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default IntelligentChat;
