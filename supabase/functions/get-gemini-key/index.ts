
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // La API key está configurada como secreto en Supabase
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyBENPv2PQo6TaDe8Mplg1WhF3n70DDm2Wc';
    
    console.log('Returning Gemini API key for chat functionality');
    
    return new Response(
      JSON.stringify({ 
        apiKey: geminiApiKey,
        status: 'success' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('Error getting Gemini API key:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        status: 'error' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
