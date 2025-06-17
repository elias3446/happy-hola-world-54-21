
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, FileText, X, FileUp, Eye } from 'lucide-react';
import { ragService } from '@/services/ragService';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocumentUploaderProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [documents, setDocuments] = useState(ragService.getDocuments());
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTab, setUploadTab] = useState<string>("text");
  const [viewingDocument, setViewingDocument] = useState<{id: string, content: string, title?: string} | null>(null);

  const handleAddDocument = () => {
    if (uploadTab === "text" && content.trim()) {
      ragService.addDocument(content.trim(), { title: title.trim() || undefined });
      setDocuments(ragService.getDocuments());
      setTitle('');
      setContent('');
      toast({ title: "Documento añadido" });
    } else if (uploadTab === "file" && fileContent) {
      ragService.addDocument(fileContent.trim(), { title: fileName || title.trim() || undefined });
      setDocuments(ragService.getDocuments());
      setTitle('');
      setFileContent(null);
      setFileName(null);
      toast({ title: "Documento añadido desde archivo" });
    }
  };

  const handleRemoveDocument = (id: string) => {
    ragService.removeDocument(id);
    setDocuments(ragService.getDocuments());
    toast({ title: "Documento eliminado" });
  };

  const handleClearAll = () => {
    ragService.clearDocuments();
    setDocuments([]);
    toast({ title: "Todos los documentos eliminados" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
    };
    reader.onerror = () => {
      toast({ 
        title: "Error al leer el archivo", 
        variant: "destructive" 
      });
    };
    
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string);
      };
      reader.onerror = () => {
        toast({ 
          title: "Error al leer el archivo", 
          variant: "destructive" 
        });
      };
      
      reader.readAsText(file);
    }
  };

  const handleViewDocument = (id: string) => {
    const doc = documents.find(doc => doc.id === id);
    if (doc) {
      setViewingDocument({
        id: doc.id,
        content: doc.content,
        title: doc.metadata?.title
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={viewingDocument ? "sm:max-w-2xl" : "sm:max-w-md"}>
        {viewingDocument ? (
          <>
            <DialogHeader>
              <DialogTitle>{viewingDocument.title || "Documento"}</DialogTitle>
              <DialogDescription>
                Contenido del documento
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-2">
              <div className="border rounded-md p-4 max-h-96 overflow-y-auto whitespace-pre-wrap text-sm">
                {viewingDocument.content}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingDocument(null)}>Volver</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Gestionar Documentos</DialogTitle>
              <DialogDescription>
                Añade documentos de referencia para mejorar las respuestas del chat.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={uploadTab} onValueChange={setUploadTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="text">Texto</TabsTrigger>
                <TabsTrigger value="file">Archivo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title-text">Título (opcional)</Label>
                  <Input 
                    id="title-text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nombre del documento"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content-text">Contenido del documento</Label>
                  <Textarea 
                    id="content-text" 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Añade aquí el contenido de referencia..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <Button 
                  onClick={handleAddDocument} 
                  disabled={!content.trim()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" /> Añadir Documento
                </Button>
              </TabsContent>
              
              <TabsContent value="file" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title-file">Título (opcional)</Label>
                  <Input 
                    id="title-file" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nombre del documento"
                  />
                </div>
                
                <div 
                  className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".txt,.md,.csv,.json,.html"
                  />
                  <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    {fileContent ? fileName : "Arrastra o haz clic para subir un archivo"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos soportados: .txt, .md, .csv, .json, .html
                  </p>
                </div>
                
                {fileContent && (
                  <div className="border rounded p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="text-sm truncate">{fileName}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setFileContent(null);
                        setFileName(null);
                      }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={handleAddDocument} 
                  disabled={!fileContent}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" /> Añadir Documento
                </Button>
              </TabsContent>
            </Tabs>
            
            <div className="space-y-3 mt-4">
              <h3 className="font-medium text-sm">Documentos Existentes ({documents.length})</h3>
              {documents.length > 0 ? (
                <>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between border rounded p-2">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[180px]">
                            {(doc.metadata?.title || doc.content.substring(0, 30) + (doc.content.length > 30 ? '...' : ''))}
                          </span>
                        </div>
                        <div className="flex">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveDocument(doc.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full mt-2" 
                    onClick={handleClearAll}
                  >
                    Eliminar todos los documentos
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No hay documentos añadidos.</p>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cerrar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploader;
