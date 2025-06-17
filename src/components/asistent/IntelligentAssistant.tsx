
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Search, Phone, Video } from 'lucide-react';
import AssistantIndex from './Index';

const IntelligentAssistant: React.FC = () => {
  const { user } = useAuth();

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'TU';
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white">
      {/* Header estilo WhatsApp */}
      <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-green-600 text-white font-medium">
              JA
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h1 className="font-medium text-base">JARVIS</h1>
            <p className="text-xs text-green-200">Asistente Virtual • En línea</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 text-white hover:bg-white/10 rounded-full"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 text-white hover:bg-white/10 rounded-full"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 text-white hover:bg-white/10 rounded-full"
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 text-white hover:bg-white/10 rounded-full"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Chat que ocupa todo el espacio disponible */}
      <div className="flex-1 overflow-hidden">
        <AssistantIndex />
      </div>

      {/* Barra inferior con información del usuario */}
      <div className="bg-[#f0f2f5] px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Avatar className="w-4 h-4">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span>Conectado como {user?.email}</span>
        </div>
      </div>
    </div>
  );
};

export default IntelligentAssistant;
