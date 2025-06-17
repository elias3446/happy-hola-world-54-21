
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface MemoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  conversationContext: string;
  conversationMemory: Record<string, any>;
}

// Helper function to check if an object is empty or contains only empty objects
const isEmptyOrContainsOnlyEmptyObjects = (obj: any): boolean => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.length === 0;
  }

  if (Object.keys(obj).length === 0) {
    return true;
  }

  // Check if all values are empty objects themselves
  return Object.values(obj).every(value => 
    typeof value === 'object' && value !== null && isEmptyOrContainsOnlyEmptyObjects(value)
  );
};

// Component to recursively render memory objects
const MemoryItem = ({ keyName, value, depth = 0 }: { keyName: string, value: any, depth?: number }) => {
  // Skip rendering empty objects
  if (typeof value === 'object' && value !== null && isEmptyOrContainsOnlyEmptyObjects(value)) {
    return null;
  }

  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return (
        <div className="ml-2">
          <div className="flex items-start space-x-2 mb-1">
            <Badge variant="outline" className="whitespace-nowrap">{keyName}</Badge>
            <div className="space-y-1">
              {value.map((item: any, index: number) => (
                <div key={index} className="ml-2">
                  {typeof item === 'object' && item !== null ? (
                    <div className="space-y-1">
                      {Object.entries(item).map(([subKey, subValue]) => (
                        <MemoryItem key={subKey} keyName={subKey} value={subValue} depth={depth + 1} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm">{String(item)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="ml-2">
          <div className="flex items-start space-x-2 mb-2">
            <Badge variant="outline" className="whitespace-nowrap">{keyName}</Badge>
            <div className="space-y-1">
              {Object.entries(value).map(([subKey, subValue]) => (
                <MemoryItem key={subKey} keyName={subKey} value={subValue} depth={depth + 1} />
              ))}
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={`flex items-start space-x-2 mb-1 ${depth > 0 ? "ml-2" : ""}`}>
      <Badge variant="outline" className="whitespace-nowrap">{keyName}</Badge>
      <span className="text-sm">{String(value)}</span>
    </div>
  );
};

const MemoryViewer = ({
  isOpen,
  onClose,
  conversationContext,
  conversationMemory,
}: MemoryViewerProps) => {
  // Filter out empty objects from memory
  const filteredMemory = Object.entries(conversationMemory).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) {
      if (!isEmptyOrContainsOnlyEmptyObjects(value)) {
        acc[key] = value;
      }
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

  const hasMemory = Object.keys(filteredMemory).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Memoria del Chat</DialogTitle>
          <DialogDescription>
            Información que el asistente ha aprendido durante la conversación
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm">Contexto de la Conversación:</h3>
            <ScrollArea className="h-32 p-2 border rounded-md bg-muted/40">
              <p className="text-sm whitespace-pre-wrap">{conversationContext || "No hay contexto guardado."}</p>
            </ScrollArea>
          </div>
          <div>
            <h3 className="font-medium text-sm">Información Memorizada:</h3>
            <ScrollArea className="h-48 p-2 border rounded-md bg-muted/40">
              {hasMemory ? (
                <div className="space-y-2">
                  {Object.entries(filteredMemory).map(([key, value]) => (
                    <MemoryItem key={key} keyName={key} value={value} />
                  ))}
                </div>
              ) : (
                <p className="text-sm">No hay información memorizada.</p>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemoryViewer;
