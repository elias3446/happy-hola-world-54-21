
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MessageCircle } from 'lucide-react';
import IntelligentAssistant from '@/components/asistent/IntelligentAssistant';

export const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 bg-[#25d366] hover:bg-[#20c05a] group"
          >
            <MessageCircle className="h-7 w-7 transition-transform group-hover:scale-110 text-white" />
            <span className="sr-only">Abrir Asistente JARVIS</span>
            
            {/* Indicador de actividad estilo WhatsApp */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs text-white font-bold">1</span>
            </div>
          </Button>
        </SheetTrigger>
        
        <SheetContent 
          side="right" 
          className="w-full sm:w-[600px] lg:w-[800px] xl:w-[1000px] p-0 max-w-none"
        >
          <div className="h-full">
            <IntelligentAssistant />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
