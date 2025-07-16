import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Download extension request received');

    // Get all extension files from storage
    const { data: files, error: listError } = await supabase.storage
      .from('extensions')
      .list('v1.0.0');

    if (listError) {
      console.error('Error listing files:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to list extension files' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Found files:', files?.map(f => f.name));

    // Create a ZIP archive with all extension files
    const zip = new Map<string, Uint8Array>();

    for (const file of files || []) {
      if (file.name === '.emptyFolderPlaceholder') continue;
      
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('extensions')
          .download(`v1.0.0/${file.name}`);

        if (downloadError) {
          console.error(`Error downloading ${file.name}:`, downloadError);
          continue;
        }

        if (fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          zip.set(file.name, new Uint8Array(arrayBuffer));
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    // For simplicity, return a JSON response with file list and download URLs
    // In a real implementation, you'd create a proper ZIP file
    const downloadUrls = await Promise.all(
      (files || [])
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from('extensions')
            .createSignedUrl(`v1.0.0/${file.name}`, 3600); // 1 hour expiry
          
          return {
            name: file.name,
            url: urlData?.signedUrl,
            size: file.metadata?.size
          };
        })
    );

    return new Response(
      JSON.stringify({
        version: '1.0.0',
        files: downloadUrls.filter(f => f.url),
        downloadCount: downloadUrls.length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    console.error('Extension download error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})