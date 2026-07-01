import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://qbuwoyhetcddfwqvpjks.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidXdveWhldGNkZGZ3cXZwamtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDI1NzIsImV4cCI6MjA5MzcxODU3Mn0.Z5vWB_RLp4ErydocABZrg-4BRJeEoplFJoXB7uAfTU0',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
