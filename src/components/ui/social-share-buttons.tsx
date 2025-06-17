
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Share2, Facebook, Twitter, MessageCircle, Copy, ExternalLink } from 'lucide-react';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description: string;
  trigger?: React.ReactNode;
}

export const SocialShareButtons = ({ 
  url, 
  title, 
  description, 
  trigger 
}: SocialShareButtonsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  };

  const handleShare = (platform: string) => {
    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
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
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Enlace copiado",
        description: "El enlace del reporte ha sido copiado al portapapeles",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <Share2 className="h-4 w-4" />
      <span className="hidden sm:inline">Compartir</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Reporte
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-2 justify-start"
            >
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 justify-start"
            >
              <Twitter className="h-4 w-4 text-sky-500" />
              Twitter
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-2 justify-start"
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp
            </Button>
            
            {navigator.share && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNativeShare}
                className="flex items-center gap-2 justify-start"
              >
                <ExternalLink className="h-4 w-4" />
                Compartir
              </Button>
            )}
          </div>
          
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar enlace
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
