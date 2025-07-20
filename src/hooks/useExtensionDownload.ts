import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExtensionFile {
  name: string;
  url: string;
  size?: number;
}

interface DownloadResponse {
  version: string;
  files: ExtensionFile[];
  downloadCount: number;
}

export const useExtensionDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const downloadExtension = async () => {
    try {
      setIsDownloading(true);

      toast({
        title: "Starting download...",
        description: "Preparing your FileGrabber extension",
      });

      // Download the zip file directly
      const response = await fetch('/FileGrabber-Extension.zip');
      
      if (!response.ok) {
        throw new Error('Failed to download extension');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'FileGrabber-Extension.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download complete!",
        description: "FileGrabber extension downloaded successfully",
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the extension. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadExtension,
    isDownloading
  };
};