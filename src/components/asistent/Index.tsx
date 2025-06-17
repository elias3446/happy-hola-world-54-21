
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import IntelligentChat from './IntelligentChat';
import { Brain } from 'lucide-react';

export const AssistantIndex: React.FC = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl h-full">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Asistente Virtual Inteligente
          </CardTitle>
          <CardDescription>
            Tu asistente personal para gestionar el sistema. Pregúntame lo que necesites o solicita que ejecute acciones específicas.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <IntelligentChat />
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantIndex;
