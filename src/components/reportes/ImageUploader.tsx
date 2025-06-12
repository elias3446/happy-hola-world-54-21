
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  pendingFiles: File[];
  onImagesChange: (images: string[]) => void;
  onPendingFilesChange: (files: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export const ImageUploader = ({ 
  images, 
  pendingFiles, 
  onImagesChange, 
  onPendingFilesChange, 
  maxImages = 10,
  disabled = false 
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validar límite de imágenes (existentes + pendientes + nuevas)
    const totalImages = images.length + pendingFiles.length + files.length;
    if (totalImages > maxImages) {
      alert(`Solo puedes subir un máximo de ${maxImages} imágenes en total`);
      return;
    }

    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validar tamaño de archivo (máximo 10MB por imagen)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert('Las imágenes no pueden ser mayores a 10MB');
      return;
    }

    // Agregar archivos a pendientes
    onPendingFilesChange([...pendingFiles, ...files]);

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const removePendingFile = (index: number) => {
    const newPendingFiles = pendingFiles.filter((_, i) => i !== index);
    onPendingFilesChange(newPendingFiles);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const totalImages = images.length + pendingFiles.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Imágenes ({totalImages}/{maxImages})
        </h3>
        
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileSelect}
          disabled={disabled || totalImages >= maxImages}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Seleccionar Imágenes
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {totalImages > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
          {/* Imágenes ya subidas */}
          {images.map((imageUrl, index) => (
            <Card key={`uploaded-${index}`} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="text-xs truncate block">
                      Imagen subida
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    disabled={disabled}
                    className="flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Archivos pendientes de subir */}
          {pendingFiles.map((file, index) => (
            <Card key={`pending-${index}`} className="relative border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="text-xs truncate block border-blue-300 text-blue-700">
                      {file.name} (pendiente)
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removePendingFile(index)}
                    disabled={disabled}
                    className="flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card 
          className="border-dashed border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
          onClick={triggerFileSelect}
        >
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay imágenes seleccionadas</p>
            <p className="text-sm text-gray-500">Haz clic aquí para seleccionar imágenes</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
