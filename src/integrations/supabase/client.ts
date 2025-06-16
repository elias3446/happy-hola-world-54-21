
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://yetjkfmxteupnoibhfmd.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldGprZm14dGV1cG5vaWJoZm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMTkxMDAsImV4cCI6MjA2NDg5NTEwMH0.r_8lNOsIAog1MMYNR5Lf2StIgaZRRSs_aSOuRgbGRj0"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
});
