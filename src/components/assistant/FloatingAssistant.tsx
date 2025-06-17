
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Brain } from 'lucide-react';
import IntelligentAssistant from '@/components/asistent/IntelligentAssistant';

export const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 group"
          >
            <Brain className="h-7 w-7 transition-transform group-hover:scale-110" />
            <span className="sr-only">Abrir Asistente Inteligente</span>
            
            {/* Indicador de actividad */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </Button>
        </SheetTrigger>
        
        <SheetContent 
          side="right" 
          className="w-full sm:w-[700px] lg:w-[900px] xl:w-[1200px] p-0 max-w-none"
        >
          <div className="h-full">
            <IntelligentAssistant />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
