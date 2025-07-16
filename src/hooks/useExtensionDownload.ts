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
        title: "Preparing Download",
        description: "Fetching extension files from server...",
      });

      // Call the edge function to get download URLs
      const { data, error } = await supabase.functions.invoke('download-extension');

      if (error) {
        throw new Error(error.message);
      }

      const downloadData = data as DownloadResponse;

      if (!downloadData.files || downloadData.files.length === 0) {
        throw new Error('No extension files available');
      }

      toast({
        title: "Download Started",
        description: `Downloading ${downloadData.files.length} files...`,
      });

      // Download each file
      let downloadedCount = 0;
      const downloadPromises = downloadData.files.map(async (file) => {
        try {
          const response = await fetch(file.url);
          if (!response.ok) {
            throw new Error(`Failed to download ${file.name}`);
          }

          const blob = await response.blob();
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          downloadedCount++;
          
          // Show progress
          if (downloadedCount < downloadData.files.length) {
            toast({
              title: "Download Progress",
              description: `Downloaded ${downloadedCount}/${downloadData.files.length} files`,
            });
          }
        } catch (error) {
          console.error(`Error downloading ${file.name}:`, error);
        }
      });

      await Promise.all(downloadPromises);

      toast({
        title: "Download Complete",
        description: `FileGrabber v${downloadData.version} downloaded successfully! Check your downloads folder.`,
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download extension",
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