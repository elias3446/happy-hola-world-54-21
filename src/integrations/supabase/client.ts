// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yetjkfmxteupnoibhfmd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldGprZm14dGV1cG5vaWJoZm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMTkxMDAsImV4cCI6MjA2NDg5NTEwMH0.r_8lNOsIAog1MMYNR5Lf2StIgaZRRSs_aSOuRgbGRj0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);