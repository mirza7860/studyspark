
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  "https://enjvzmvldggbvvvbmtpo.supabase.co";
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuanZ6bXZsZGdnYnZ2dmJtdHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjA5NTUsImV4cCI6MjA3NTkzNjk1NX0.hoSpOQYZAhDSPgyvHZsze42Mn0IWm52QlIKPlaVRLos";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
