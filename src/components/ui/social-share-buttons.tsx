
import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, MessageCircle, Share2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  className?: string;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  url,
  title,
  description = '',
  hashtags = [],
  className = ''
}) => {
  const { toast } = useToast();
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.map(tag => encodeURIComponent(tag)).join(',');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtagString}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const openShareWindow = (url: string, platform: string) => {
    const width = 600;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Enlace copiado",
        description: "El enlace del reporte ha sido copiado al portapapeles",
      });
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Enlace copiado",
        description: "El enlace del reporte ha sido copiado al portapapeles",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        // El usuario canceló o hubo un error
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copiar al portapapeles
      copyToClipboard();
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openShareWindow(shareLinks.facebook, 'facebook')}
        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => openShareWindow(shareLinks.twitter, 'twitter')}
        className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">Twitter</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => openShareWindow(shareLinks.whatsapp, 'whatsapp')}
        className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>

      {/* Botón nativo de compartir para móviles */}
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="flex items-center gap-2 sm:hidden"
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        <span className="hidden sm:inline">Copiar enlace</span>
      </Button>
    </div>
  );
};
