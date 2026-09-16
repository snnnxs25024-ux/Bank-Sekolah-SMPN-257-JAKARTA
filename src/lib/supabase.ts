import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qavcgqftxomlcdfpbuxa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdmNncWZ0eG9tbGNkZnBidXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0OTgyMzQsImV4cCI6MjEwNTA3NDIzNH0.Bz2dfyhrclBgmrXJHJIFWeblPksIovsCNuGSedO8hN0';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
