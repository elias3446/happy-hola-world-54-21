
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ingresar API Key de Gemini</DialogTitle>
          <DialogDescription>
            Necesitamos tu API Key de Google AI Studio (Gemini) para continuar. Esta clave se guardará localmente en tu navegador.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right col-span-1">
              API Key
            </Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Ingresa tu API Key aquí"
              type="password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" onClick={handleSave} disabled={!apiKey.trim()}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
