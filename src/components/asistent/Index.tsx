
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import IntelligentChat from './IntelligentChat';
import { Brain, MessageCircle } from 'lucide-react';

export const AssistantIndex: React.FC = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Asistente Virtual Inteligente
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Tu asistente personal para gestionar el sistema. Pregúntame lo que necesites o solicita que ejecute acciones específicas.
        </p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat Inteligente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Asistente Conversacional
              </CardTitle>
              <CardDescription>
                Conversa conmigo en lenguaje natural. Puedo ayudarte con información, análisis, crear/actualizar/eliminar registros y mucho más.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntelligentChat />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssistantIndex;
