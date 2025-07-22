
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

      // Create array of file paths to include in the zip
      const filesList = [
        '/File Grabber/manifest.json',
        '/File Grabber/background.js',
        '/File Grabber/content.js',
        '/File Grabber/popup.html',
        '/File Grabber/popup.js',
        '/File Grabber/icon.png',
      ];

      // Prepare the zip file for download
      const zipUrl = '/FileGrabber-Extension.zip';
      const response = await fetch(zipUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download extension: ${response.status} ${response.statusText}`);
      }

      // Create a blob from the zip file
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger the download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'FileGrabber-Extension.zip';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
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
