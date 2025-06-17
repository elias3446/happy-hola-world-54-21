
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Bot } from 'lucide-react';
import AssistantIndex from '@/components/asistent/Index';

export const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 bg-primary hover:bg-primary/90"
          >
            <Bot className="h-6 w-6" />
            <span className="sr-only">Abrir Asistente Virtual</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent 
          side="right" 
          className="w-full sm:w-[600px] lg:w-[800px] xl:w-[1000px] p-0 max-w-none"
        >
          <div className="h-full">
            <AssistantIndex />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
